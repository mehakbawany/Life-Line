import prisma from "@/lib/prisma";

/**
 * Triggers the automatic dispatch algorithm for an emergency request.
 * Finds the nearest or first available ambulance and assigns it to the request.
 */
export async function triggerDispatch(requestId: string) {
  console.log(`[DISPATCH] Triggering auto-dispatch for request: ${requestId}`);
  
  try {
    // Find the first available ambulance
    const availableAmbulance = await prisma.ambulance.findFirst({
      where: { status: "AVAILABLE" }
    });

    if (availableAmbulance) {
      await prisma.$transaction([
        // Assign the request to the ambulance and update its status
        prisma.ambulance.update({
          where: { id: availableAmbulance.id },
          data: {
            status: "EN_ROUTE_TO_PATIENT",
            currentRequestId: requestId
          }
        }),
        // Update request status to ASSIGNED
        prisma.emergencyRequest.update({
          where: { id: requestId },
          data: { status: "ASSIGNED" }
        }),
        // Log the assignment action
        prisma.dispatchLog.create({
          data: {
            action: "ASSIGNED",
            notes: `Auto-assigned ambulance ${availableAmbulance.vehicleNumber}`,
            requestId: requestId,
            ambulanceId: availableAmbulance.id
          }
        })
      ]);
      console.log(`[DISPATCH] Auto-assigned Ambulance ${availableAmbulance.vehicleNumber} to Request ${requestId}`);
    } else {
      console.log(`[DISPATCH] No available ambulance for Request ${requestId}. Request remains PENDING.`);
    }
  } catch (error) {
    console.error(`[DISPATCH ERROR] Failed auto-dispatch for request ${requestId}:`, error);
  }
}
