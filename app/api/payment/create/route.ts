import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const FLAT_FEE = 500; // $500 base fee
const DISTANCE_RATE = 10; // $10 per km

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, method, distanceKm, userId } = body;

    if (!requestId || !method || distanceKm === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, method, distanceKm" },
        { status: 400 }
      );
    }

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Emergency request not found" },
        { status: 404 }
      );
    }

    // Calculate amount: flat fee + distance multiplier
    const amount = FLAT_FEE + (parseFloat(distanceKm) * DISTANCE_RATE);

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: "USD",
        method,
        status: "PENDING", // PENDING acts as DUE
        dueDate,
        requestId,
        userId: userId || request.userId || undefined,
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("[PAYMENT CREATE ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
