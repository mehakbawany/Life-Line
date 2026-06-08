import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");

    let specialtyFilter = {};

    // Basic capacity-aware routing logic
    if (severity === "CRITICAL" || severity === "NATIONAL_EMERGENCY") {
      specialtyFilter = { specialty: "TRAUMA" };
    }

    const hospitals = await prisma.hospital.findMany({
      where: {
        ...specialtyFilter,
        availableBeds: { gt: 0 }
      },
      orderBy: { availableBeds: "desc" }
    });

    return NextResponse.json({ success: true, hospitals });
  } catch (error) {
    console.error("[HOSPITAL ROUTING ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
