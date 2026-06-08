import { PrismaClient } from '@prisma/client';

// Dedicated prisma client for the worker
const prisma = new PrismaClient();

const TICK_RATE = 3000; // 3 seconds loop
const RESERVE_PERCENTAGE = 0.15; // 15% city safety reserve

/**
 * Global Health State Evaluator
 */
async function updateGlobalHealthState() {
  const totalAmbulances = await prisma.ambulance.count();
  const availableAmbulances = await prisma.ambulance.count({
    where: { status: "AVAILABLE" }
  });

  const availableRatio = totalAmbulances > 0 ? availableAmbulances / totalAmbulances : 0;
  
  let healthState: "NORMAL" | "STRESSED" | "CRITICAL" | "OVERLOAD" = "NORMAL";

  if (availableRatio < 0.05) healthState = "OVERLOAD";
  else if (availableRatio < 0.10) healthState = "CRITICAL";
  else if (availableRatio < RESERVE_PERCENTAGE) healthState = "STRESSED";

  // Upsert the system state to avoid massive DB bloat, assuming id 1
  const existingState = await prisma.systemState.findFirst();
  
  if (existingState) {
    await prisma.systemState.update({
      where: { id: existingState.id },
      data: { healthState, lastEvaluatedAt: new Date() }
    });
  } else {
    await prisma.systemState.create({
      data: { healthState }
    });
  }

  return healthState;
}

/**
 * State Machine Processor for a single Request
 */
async function processRequest(request: any, healthState: string) {
  // 1. Priority & Reserve Filter
  if (healthState === "OVERLOAD" && request.severity !== "NATIONAL_EMERGENCY" && request.severity !== "CRITICAL") {
    // Overload restrict mode: Queued + Review
    if (request.status !== "QUEUED") {
      await prisma.emergencyRequest.update({ where: { id: request.id }, data: { status: "QUEUED" } });
      console.log(`[WORKER] System OVERLOAD. Request ${request.id} queued for manual review.`);
    }
    return;
  }

  // 2. Trust System Evaluator
  if (request.user?.trustScore && request.user.trustScore < 40 && request.status !== "QUEUED") {
    await prisma.emergencyRequest.update({ where: { id: request.id }, data: { status: "QUEUED" } });
    console.log(`[WORKER] Low trust score. Request ${request.id} queued for manual verification.`);
    
    await prisma.systemAuditLog.create({
      data: { actionType: "TRUST_SYSTEM_FLAG", details: `User score ${request.user.trustScore} caused queueing for req ${request.id}` }
    });
    return;
  }

  // 3. Find Ambulance (Pessimistic Hard Locking via DB transactions)
  // To avoid race conditions, we use a transaction to lock the ambulance instantly
  const assignment = await prisma.$transaction(async (tx) => {
    // Fetch nearest available (Simplified to first available for MVP)
    const ambulance = await tx.ambulance.findFirst({
      where: { status: "AVAILABLE" }
    });

    if (!ambulance) return null;

    // Hard Lock the ambulance
    await tx.ambulance.update({
      where: { id: ambulance.id },
      data: { status: "EN_ROUTE" } // Locking it so it's no longer AVAILABLE
    });

    // Create the Dispatch Assignment (State Machine Node)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 15); // 15s to accept

    const newAssignment = await tx.dispatchAssignment.create({
      data: {
        requestId: request.id,
        ambulanceId: ambulance.id,
        status: "PENDING_ACCEPTANCE",
        expiresAt
      }
    });

    await tx.emergencyRequest.update({
      where: { id: request.id },
      data: { status: "ASSIGNED" }
    });

    return newAssignment;
  });

  if (assignment) {
    console.log(`[WORKER] Assigned Ambulance ${assignment.ambulanceId} to Request ${request.id}`);
  } else {
    console.log(`[WORKER] No available ambulances for Request ${request.id}`);
  }
}

/**
 * Cascade Recovery: Handle timed-out or failed assignments
 */
async function handleCascadeRecovery() {
  const expiredAssignments = await prisma.dispatchAssignment.findMany({
    where: {
      status: "PENDING_ACCEPTANCE",
      expiresAt: { lt: new Date() }
    }
  });

  for (const assignment of expiredAssignments) {
    console.log(`[WORKER] Assignment ${assignment.id} timed out. Initiating Cascade Recovery...`);

    await prisma.$transaction(async (tx) => {
      // Mark failed
      await tx.dispatchAssignment.update({
        where: { id: assignment.id },
        data: { status: "FAILED_MID_ROUTE", rejectionReason: "Driver Timeout" }
      });

      // Free the ambulance but soft block it as penalty
      await tx.ambulance.update({
        where: { id: assignment.ambulanceId },
        data: { status: "SOFT_BLOCKED" }
      });

      // Mark request back to PENDING and bump escalation count
      await tx.emergencyRequest.update({
        where: { id: assignment.requestId },
        data: { 
          status: "PENDING",
          escalationCount: { increment: 1 }
        }
      });
      
      // Audit Log
      await tx.systemAuditLog.create({
        data: {
          actionType: "CASCADE_RECOVERY",
          details: `Ambulance ${assignment.ambulanceId} timed out on request ${assignment.requestId}`
        }
      });
    });
  }
}

/**
 * Centralized Worker Loop
 */
async function runWorkerLoop() {
  console.log("[WORKER] Booting LifeLine EMS Dispatch Engine...");

  setInterval(async () => {
    try {
      // 1. Evaluate System Health
      const healthState = await updateGlobalHealthState();

      // 2. Cascade Recovery (Failures & Timeouts)
      await handleCascadeRecovery();

      // 3. Process PENDING Requests
      const pendingRequests = await prisma.emergencyRequest.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: [
          { severity: 'desc' }, // Critical first
          { createdAt: 'asc' }  // Oldest first
        ],
        take: 10 // Batch size
      });

      for (const req of pendingRequests) {
        await processRequest(req, healthState);
      }

    } catch (err) {
      console.error("[WORKER ERROR]", err);
    }
  }, TICK_RATE);
}

// Start
runWorkerLoop();
