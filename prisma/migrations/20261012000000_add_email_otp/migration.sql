
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeTokenHash" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrustedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OtpChallenge_challengeTokenHash_key"
ON "OtpChallenge"("challengeTokenHash");

CREATE INDEX "OtpChallenge_userId_createdAt_idx"
ON "OtpChallenge"("userId", "createdAt");

CREATE UNIQUE INDEX "TrustedDevice_tokenHash_key"
ON "TrustedDevice"("tokenHash");

CREATE INDEX "TrustedDevice_userId_idx"
ON "TrustedDevice"("userId");

ALTER TABLE "OtpChallenge"
ADD CONSTRAINT "OtpChallenge_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrustedDevice"
ADD CONSTRAINT "TrustedDevice_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
