import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, role } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required for OTP" }, { status: 400 });
    }

    // Upsert user (simulating OTP verification success for MVP)
    const user = await prisma.user.upsert({
      where: { phoneNumber: phone },
      update: { role: role || "USER" },
      create: {
        phoneNumber: phone,
        name: "Verified User",
        role: role || "USER"
      }
    });

    // Create session token
    const token = await encrypt({ userId: user.id, role: user.role });

    // Set cookie
    const response = NextResponse.json({ success: true, user }, { status: 200 });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
