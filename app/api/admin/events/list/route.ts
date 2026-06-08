import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        eventAssignments: {
          include: { 
            ambulance: {
              select: { vehicleNumber: true, status: true }
            } 
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error("[EVENT LIST ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
