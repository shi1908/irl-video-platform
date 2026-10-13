
import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";
import { prisma } from "@/lib/prisma";

// Require a strong secret from your local .env file
function getSecret(): string {
  const secret = process.env.OTP_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "OTP_SECRET must be configured with at least 32 characters."
    );
  }

  return secret;
}

// Hash OTP codes and challenge tokens
export function hashValue(value: string): string {
  return createHash("sha256")
    .update(`${getSecret()}:${value}`)
    .digest("hex");
}

// Compare hashes safely
export function verifyHash(
  value: string,
  expectedHash: string
): boolean {
  const actual = Buffer.from(hashValue(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

// Generate a random six-digit OTP
export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

// Generate a secure random challenge token
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Create and store an OTP challenge
export async function createOtpChallenge(userId: string) {
  const code = generateOtp();
  const token = generateToken();
  const now = new Date();

  // Expire earlier unused challenges for this user
  await prisma.otpChallenge.updateMany({
    where: {
      userId,
      consumedAt: null,
    },
    data: {
      consumedAt: now,
    },
  });

  // Store only hashes, never the raw OTP or token
  await prisma.otpChallenge.create({
    data: {
      userId,
      challengeTokenHash: hashValue(token),
      codeHash: hashValue(code),
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      lastSentAt: now,
    },
  });

  return { code, token };
}
