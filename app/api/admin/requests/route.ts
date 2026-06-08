import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.emergencyRequest.findMany({
      where: {
        status: {
          in: ["PENDING", "ASSIGNED", "EN_ROUTE", "ON_SCENE", "TRANSPORTING"]
        }
      },
      include: {
        dispatchAssignments: {
          include: {
            ambulance: {
              select: {
                vehicleNumber: true,
                status: true,
              }
            }
          },
          orderBy: { assignedAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error) {
    console.error("[ADMIN REQUESTS ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
