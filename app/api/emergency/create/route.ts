import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { triggerDispatch } from "@/services/dispatchService";
import { SeverityLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { phone, latitude, longitude, pickupLocation, severity, patientName } = body;

    // Validate required fields
    if (!phone || latitude === undefined || longitude === undefined || !severity) {
      return NextResponse.json(
        { error: "Missing required fields: phone, latitude, longitude, and severity are required." },
        { status: 400 }
      );
    }

    // Validate severity enum
    if (!Object.values(SeverityLevel).includes(severity as SeverityLevel)) {
      return NextResponse.json(
        { error: `Invalid severity level. Must be one of: ${Object.values(SeverityLevel).join(", ")}` },
        { status: 400 }
      );
    }

    const latFloat = parseFloat(latitude);
    const lngFloat = parseFloat(longitude);

    if (isNaN(latFloat) || isNaN(lngFloat)) {
      return NextResponse.json(
        { error: "Latitude and longitude must be valid numbers." },
        { status: 400 }
      );
    }

    // Log request creation details
    console.log(`[EMERGENCY REQUEST] Incoming phone: ${phone}, Location: (${latFloat}, ${lngFloat}), Severity: ${severity}`);

    // Create EmergencyRequest in database
    const emergencyRequest = await prisma.emergencyRequest.create({
      data: {
        patientName: patientName || "Emergency Patient",
        patientPhone: phone,
        pickupLocation: pickupLocation || `Location coordinates: ${latFloat}, ${lngFloat}`,
        pickupLat: latFloat,
        pickupLng: lngFloat,
        severity: severity as SeverityLevel,
        status: "PENDING"
      }
    });

    console.log(`[EMERGENCY REQUEST] Created ID: ${emergencyRequest.id} in ${Date.now() - startTime}ms`);

    // Trigger auto-dispatch logic
    await triggerDispatch(emergencyRequest.id);

    return NextResponse.json({
      success: true,
      requestId: emergencyRequest.id
    }, { status: 201 });
    
  } catch (error) {
    console.error("[EMERGENCY REQUEST ERROR] Failed to create request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
