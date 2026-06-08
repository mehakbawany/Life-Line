import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to calculate distance in km using Haversine formula
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const limitParam = searchParams.get("limit");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude (lat) and longitude (lng) are required query parameters." },
        { status: 400 }
      );
    }

    const pickupLat = parseFloat(lat);
    const pickupLng = parseFloat(lng);
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(pickupLat) || isNaN(pickupLng)) {
      return NextResponse.json(
        { error: "Latitude and longitude must be valid numbers." },
        { status: 400 }
      );
    }

    // Fetch all available ambulances that have a known location
    const availableAmbulances = await prisma.ambulance.findMany({
      where: {
        status: "AVAILABLE",
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        driver: {
          select: {
            name: true,
            phoneNumber: true,
          }
        }
      }
    });

    // Calculate distances and sort
    const rankedAmbulances = availableAmbulances.map((ambulance) => {
      const distance = calculateHaversineDistance(
        pickupLat,
        pickupLng,
        ambulance.latitude!,
        ambulance.longitude!
      );

      return {
        id: ambulance.id,
        vehicleNumber: ambulance.vehicleNumber,
        type: ambulance.type,
        status: ambulance.status,
        latitude: ambulance.latitude,
        longitude: ambulance.longitude,
        lastLocationUpdate: ambulance.lastLocationUpdate,
        driver: ambulance.driver,
        distanceKm: distance,
      };
    });

    // Sort by distance (nearest first) and apply limit
    rankedAmbulances.sort((a, b) => a.distanceKm - b.distanceKm);
    
    const nearestAmbulances = rankedAmbulances.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: nearestAmbulances.length,
      ambulances: nearestAmbulances,
    }, { status: 200 });

  } catch (error) {
    console.error("[AMBULANCE NEARBY ERROR]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
