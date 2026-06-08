import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getIO } from "@/socket/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ambulanceId, latitude, longitude } = body;

    if (!ambulanceId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: ambulanceId, latitude, and longitude are required." },
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

    // Update database in real-time
    const updatedAmbulance = await prisma.ambulance.update({
      where: { id: ambulanceId },
      data: {
        latitude: latFloat,
        longitude: lngFloat,
        lastLocationUpdate: new Date(),
      },
    });

    // Emit socket event to update admin dashboard
    const io = getIO();
    if (io) {
      io.to("admin_room").emit("ambulance_location_update", {
        ambulanceId,
        latitude: latFloat,
        longitude: lngFloat,
      });
    }

    return NextResponse.json({
      success: true,
      ambulance: {
        id: updatedAmbulance.id,
        latitude: updatedAmbulance.latitude,
        longitude: updatedAmbulance.longitude,
        lastLocationUpdate: updatedAmbulance.lastLocationUpdate,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("[AMBULANCE LOCATION UPDATE ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
