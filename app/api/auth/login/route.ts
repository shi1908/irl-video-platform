
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createOtpChallenge } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Generate and store an OTP challenge. Do NOT create a session here.
    const challenge = await createOtpChallenge(user.id);

    await sendOtpEmail(user.email, challenge.code);

    const response = NextResponse.json({
      success: true,
      requiresOtp: true,
      message: "Verification code sent to your email.",
    });

    response.cookies.set(
      "irl_pending_otp",
      challenge.token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
      }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to start verification. Please try again.",
      },
      { status: 500 }
    );
  }
}
