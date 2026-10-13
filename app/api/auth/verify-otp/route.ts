
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { generateToken, hashValue, verifyHash } from "@/lib/otp";

const PENDING_COOKIE = "irl_pending_otp";
const DEVICE_COOKIE = "irl_trusted_device";
const MAX_ATTEMPTS = 5;
const DEVICE_DAYS = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid six-digit code." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const challengeToken = cookieStore.get(PENDING_COOKIE)?.value;

    if (!challengeToken) {
      return NextResponse.json(
        { success: false, message: "Your verification expired. Please log in again." },
        { status: 401 }
      );
    }

    const challenge = await prisma.otpChallenge.findUnique({
      where: { challengeTokenHash: hashValue(challengeToken) },
      include: { user: true },
    });

    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt <= new Date()
    ) {
      const response = NextResponse.json(
        { success: false, message: "Your code expired. Please log in again." },
        { status: 401 }
      );
      response.cookies.delete(PENDING_COOKIE);
      return response;
    }

    if (challenge.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please log in again." },
        { status: 429 }
      );
    }

    const valid = verifyHash(
      `${challenge.userId}:${code}`,
      challenge.codeHash
    );

    if (!valid) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(
        { success: false, message: "Incorrect verification code." },
        { status: 400 }
      );
    }

    // Consume the challenge once. Only one request can win this update.
    const consumed = await prisma.otpChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: MAX_ATTEMPTS },
      },
      data: { consumedAt: new Date() },
    });

    if (consumed.count !== 1) {
      return NextResponse.json(
        { success: false, message: "This code is no longer valid. Log in again." },
        { status: 401 }
      );
    }

    const deviceToken = generateToken();
    const deviceExpiresAt = new Date(
      Date.now() + DEVICE_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.trustedDevice.create({
      data: {
        userId: challenge.userId,
        tokenHash: hashValue(deviceToken),
        expiresAt: deviceExpiresAt,
      },
    });

    await createSession(challenge.userId);

    const response = NextResponse.json({
      success: true,
      message: "Email verified. Login successful.",
      user: {
        id: challenge.user.id,
        username: challenge.user.username,
        email: challenge.user.email,
        avatar: challenge.user.avatar,
        createdAt: challenge.user.createdAt,
      },
    });

    response.cookies.set(DEVICE_COOKIE, deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: deviceExpiresAt,
    });

    response.cookies.delete(PENDING_COOKIE);

    return response;
  } catch (error) {
    console.error("OTP verification failed:", error instanceof Error ? error.message : "Unknown error");

    return NextResponse.json(
      { success: false, message: "Unable to verify the code. Please try again." },
      { status: 500 }
    );
  }
}
