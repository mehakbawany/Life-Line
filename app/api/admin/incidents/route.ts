import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const incidents = await prisma.incidentReport.findMany({
      include: {
        request: {
          select: {
            patientName: true,
            pickupLocation: true,
            severity: true,
          }
        },
        reportedBy: {
          select: {
            name: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    console.error("[ADMIN INCIDENTS ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
