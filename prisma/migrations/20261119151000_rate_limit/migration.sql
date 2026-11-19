-- Rate limiting that needs nothing but the database the app already has.
-- One row per limited key (an email, an address, a user); the count resets
-- when the window ends.
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
