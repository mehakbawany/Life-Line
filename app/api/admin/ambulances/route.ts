import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ambulances = await prisma.ambulance.findMany({
      include: {
        driver: {
          select: {
            name: true,
            phoneNumber: true,
          }
        },
        dispatchAssignments: {
          where: { status: "ACCEPTED" },
          include: {
            request: {
              select: { id: true, pickupLocation: true, status: true }
            }
          },
          orderBy: { assignedAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    
    return NextResponse.json({ success: true, count: ambulances.length, ambulances });
  } catch (error) {
    console.error("[ADMIN AMBULANCES ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
