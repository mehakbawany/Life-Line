import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SeverityLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { title, description, type, location, severity, estimatedVictims, maxAmbulanceCapacity } = await req.json();

    if (!title || !type || !location || !severity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        location,
        severity: severity as SeverityLevel,
        estimatedVictims: parseInt(estimatedVictims) || 0,
        maxAmbulanceCapacity: parseInt(maxAmbulanceCapacity) || 5,
        status: "ACTIVE"
      }
    });

    // Emit a system alert that a mass casualty incident was created
    const { emitSystemAlert } = await import("@/socket/server");
    emitSystemAlert("MASS_ESCALATION", { eventId: event.id, title: event.title, severity: event.severity });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("[EVENT CREATE ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
