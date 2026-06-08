import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const activeAmbulancesCount = await prisma.ambulance.count({
      where: {
        status: {
          in: ["AVAILABLE", "EN_ROUTE", "ON_MISSION"]
        }
      }
    });

    const ongoingDispatchesCount = await prisma.emergencyRequest.count({
      where: {
        status: {
          in: ["ASSIGNED", "EN_ROUTE", "ON_SCENE", "TRANSPORTING"]
        }
      }
    });

    // Fetch live health state from SystemState table
    const systemState = await prisma.systemState.findFirst({
      orderBy: { lastEvaluatedAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      status: {
        systemHealth: systemState?.healthState || "NORMAL",
        activeAmbulances: activeAmbulancesCount,
        ongoingDispatches: ongoingDispatchesCount,
      }
    });
  } catch (error) {
    console.error("[ADMIN STATUS ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
