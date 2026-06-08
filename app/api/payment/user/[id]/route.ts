import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to avoid Next.js sync dynamic route param warning
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        request: {
          select: {
            patientName: true,
            pickupLocation: true,
            severity: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, payments }, { status: 200 });
  } catch (error) {
    console.error("[PAYMENT FETCH ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
