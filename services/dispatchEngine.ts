import prisma from "@/lib/prisma";
import { AmbulanceStatus, RequestStatus, SeverityLevel } from "@prisma/client";

// In-memory locks map to prevent concurrent dispatch runs for the same request
const requestLocks = new Map<string, boolean>();

interface AmbulanceWithMetrics {
  id: string;
  vehicleNumber: string;
  latitude: number | null;
  longitude: number | null;
  status: AmbulanceStatus;
  driver: {
    id: string;
    name: string;
    _count: {
      dispatchLogs: number;
    };
  } | null;
}

/**
 * Calculates distance between two coordinates using the Haversine formula (in km)
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Scoring helper function: score = distance + trafficETA + load factor
 * Lower score is better.
 */
function calculateDispatchScore(
  distance: number,
  trafficFactor: number, // random/mock multiplier for traffic (1.0 - 2.0)
  loadFactor: number // count of driver's dispatch logs
): { score: number; trafficETA: number } {
  // Speed estimation: 45 km/h (0.75 km/minute)
  const baseETA = distance / 0.75; 
  const trafficETA = baseETA * trafficFactor;
  
  // Weights: 1km distance = 1 point, 1 min ETA = 1.2 points, 1 active job history = 0.5 points
  const score = distance + (trafficETA * 1.2) + (loadFactor * 0.5);
  
  return { score, trafficETA };
}

/**
 * Selection logic: Fetches, scores, and ranks available ambulances
 */
async function getRankedAmbulances(
  pickupLat: number,
  pickupLng: number
): Promise<Array<{ ambulance: any; score: number; trafficETA: number }>> {
  // 1. Fetch available ambulances with driver metrics
  const availableAmbulances = await prisma.ambulance.findMany({
    where: {
      status: "AVAILABLE",
      latitude: { not: null },
      longitude: { not: null }
    },
    include: {
      driver: {
        include: {
          _count: {
            select: { dispatchLogs: true }
          }
        }
      }
    }
  });

  const ranked = availableAmbulances.map((ambulance) => {
    const distance = calculateHaversineDistance(
      pickupLat,
      pickupLng,
      ambulance.latitude!,
      ambulance.longitude!
    );
    
    // Simulate traffic factor (mocking real-time traffic API)
    const trafficFactor = 1.0 + Math.random() * 0.8; // between 1.0 and 1.8
    const loadFactor = ambulance.driver?._count?.dispatchLogs || 0;
    
    const { score, trafficETA } = calculateDispatchScore(distance, trafficFactor, loadFactor);
    
    return {
      ambulance,
      score,
      trafficETA
    };
  });

  // Sort by score ascending (lowest score/best first)
  return ranked.sort((a, b) => a.score - b.score);
}

/**
 * Core dispatch function. Coordinates the assignment, locking, shadow backup dispatch, and escalation.
 */
export async function runDispatchEngine(requestId: string): Promise<boolean> {
  // --- LOCKING MECHANISM ---
  // Step 1: Check in-memory lock to prevent race conditions on parallel API/socket calls
  if (requestLocks.get(requestId)) {
    console.log(`[DISPATCH ENGINE] Lock active for request ${requestId}. Aborting execution.`);
    return false;
  }
  requestLocks.set(requestId, true);

  try {
    // Step 2: Fetch and verify request status
    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || (request.status !== "PENDING" && request.status !== "ASSIGNED")) {
      console.log(`[DISPATCH ENGINE] Request ${requestId} is not in dispatchable state.`);
      requestLocks.delete(requestId);
      return false;
    }

    console.log(`[DISPATCH ENGINE] Processing request ${requestId} (Severity: ${request.severity})`);

    // Step 3: Get ranked list of available ambulances
    const rankedAmbulances = await getRankedAmbulances(request.pickupLat, request.pickupLng);

    if (rankedAmbulances.length === 0) {
      console.log(`[DISPATCH ENGINE] No available ambulances found for request ${requestId}. Retrying later.`);
      requestLocks.delete(requestId);
      return false;
    }

    const primaryOption = rankedAmbulances[0];
    console.log(`[DISPATCH ENGINE] Selected Primary: ${primaryOption.ambulance.vehicleNumber} (Score: ${primaryOption.score.toFixed(2)})`);

    // Step 4: Handle assignment based on Severity
    if (request.severity === SeverityLevel.CRITICAL) {
      // --- SHADOW DISPATCH (Backup Ambulance) ---
      const backupOption = rankedAmbulances.length > 1 ? rankedAmbulances[1] : null;
      
      await prisma.$transaction(async (tx) => {
        // Assign Primary
        await tx.ambulance.update({
          where: { id: primaryOption.ambulance.id },
          data: {
            status: "EN_ROUTE_TO_PATIENT",
            currentRequestId: requestId
          }
        });

        // Assign Backup if available
        if (backupOption) {
          console.log(`[DISPATCH ENGINE] Selected Backup (Shadow Dispatch): ${backupOption.ambulance.vehicleNumber}`);
          await tx.ambulance.update({
            where: { id: backupOption.ambulance.id },
            data: {
              status: "OUT_OF_SERVICE" 
            }
          });
        }

        // Update Request
        await tx.emergencyRequest.update({
          where: { id: requestId },
          data: { status: "ASSIGNED" }
        });

        // Create log entries
        await tx.dispatchLog.create({
          data: {
            action: "PRIMARY_ASSIGNED",
            notes: `Primary: ${primaryOption.ambulance.vehicleNumber}. Backup: ${backupOption ? backupOption.ambulance.vehicleNumber : "None"}`,
            requestId
          }
        });
      });
    } else {
      // Standard dispatch
      await prisma.$transaction(async (tx) => {
        await tx.ambulance.update({
          where: { id: primaryOption.ambulance.id },
          data: {
            status: "EN_ROUTE_TO_PATIENT",
            currentRequestId: requestId
          }
        });

        await tx.emergencyRequest.update({
          where: { id: requestId },
          data: { status: "ASSIGNED" }
        });

        await tx.dispatchLog.create({
          data: {
            action: "ASSIGNED",
            notes: `Assigned ambulance ${primaryOption.ambulance.vehicleNumber}`,
            requestId,
            ambulanceId: primaryOption.ambulance.id
          }
        });
      });
    }

    // Emit live socket event for dispatch sent
    try {
      const { emitDispatchSent, emitRequestLocked } = await import("@/socket/server");
      const backupOption = request.severity === SeverityLevel.CRITICAL && rankedAmbulances.length > 1 ? rankedAmbulances[1] : null;
      
      emitDispatchSent({
        requestId,
        ambulanceId: primaryOption.ambulance.id,
        backupAmbulanceId: backupOption ? backupOption.ambulance.id : undefined
      });
      
      emitRequestLocked({
        requestId,
        ambulanceId: primaryOption.ambulance.id
      });
    } catch (err) {
      console.error("[DISPATCH ENGINE] Failed to emit socket event:", err);
    }

    // Step 5: Start Escalation Timer (8 Seconds)
    startEscalationTimer(requestId, primaryOption.ambulance.id);

    // Release the lock for this request run
    requestLocks.delete(requestId);
    return true;

  } catch (error) {
    console.error(`[DISPATCH ENGINE ERROR] Failed dispatch process for request ${requestId}:`, error);
    requestLocks.delete(requestId);
    return false;
  }
}

/**
 * Escalation logic: If driver has not accepted/responded within 8 seconds, re-evaluate and assign next best.
 */
function startEscalationTimer(requestId: string, assignedAmbulanceId: string) {
  setTimeout(async () => {
    try {
      console.log(`[ESCALATION TIMER] Checking status for request ${requestId}...`);
      
      const request = await prisma.emergencyRequest.findUnique({
        where: { id: requestId }
      });

      // If request has been cancelled or transitioned to "EN_ROUTE" / "ON_SCENE" (i.e. accepted by driver), do nothing.
      // In this setup, we assume acceptance means request status becomes "EN_ROUTE".
      if (!request || request.status !== "ASSIGNED") {
        console.log(`[ESCALATION TIMER] Request ${requestId} status is ${request?.status || 'deleted'}. Escalation not required.`);
        return;
      }

      console.log(`[ESCALATION TIMER] No response for request ${requestId} in 8s. Escalating and releasing ambulance ${assignedAmbulanceId}.`);

      // 1. Release failed ambulance
      await prisma.$transaction(async (tx) => {
        await tx.ambulance.update({
          where: { id: assignedAmbulanceId },
          data: {
            status: "AVAILABLE",
            currentRequestId: null
          }
        });

        // Log escalation
        await tx.dispatchLog.create({
          data: {
            action: "ESCALATED",
            notes: `Ambulance ${assignedAmbulanceId} failed to respond in 8s. Escalating request.`,
            requestId
          }
        });

        // Mark request back to PENDING so the dispatch engine can process it again
        await tx.emergencyRequest.update({
          where: { id: requestId },
          data: { status: "PENDING" }
        });
      });

      // 2. Trigger dispatch engine again to find the next best ambulance
      await runDispatchEngine(requestId);

    } catch (error) {
      console.error(`[ESCALATION TIMER ERROR] Failed escalation process for request ${requestId}:`, error);
    }
  }, 8000); // 8 seconds timeout
}
