-- Global postback: a per-affiliate sub3 value, and a raw log of every call.

CREATE TYPE "PostbackStatus" AS ENUM ('ACCEPTED', 'DUPLICATE', 'UNKNOWN_TOKEN', 'UNAUTHORIZED', 'INVALID');

ALTER TABLE "Publisher" ADD COLUMN "postbackToken" TEXT;
CREATE UNIQUE INDEX "Publisher_postbackToken_key" ON "Publisher"("postbackToken");

CREATE TABLE "PostbackHit" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT,
    "status" "PostbackStatus" NOT NULL,
    "sub3" TEXT,
    "amount" DECIMAL(12,2),
    "transactionId" TEXT,
    "offerName" TEXT,
    "rawQuery" TEXT NOT NULL,
    "ip" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostbackHit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PostbackHit_createdAt_idx" ON "PostbackHit"("createdAt");
CREATE INDEX "PostbackHit_publisherId_createdAt_idx" ON "PostbackHit"("publisherId", "createdAt");
CREATE INDEX "PostbackHit_status_createdAt_idx" ON "PostbackHit"("status", "createdAt");
CREATE INDEX "PostbackHit_publisherId_transactionId_idx" ON "PostbackHit"("publisherId", "transactionId");

ALTER TABLE "PostbackHit" ADD CONSTRAINT "PostbackHit_publisherId_fkey"
  FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
