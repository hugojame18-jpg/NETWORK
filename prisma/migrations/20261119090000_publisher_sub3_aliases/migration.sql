-- Additional sub3 values per affiliate. The primary one stays on
-- "Publisher"."postbackToken"; these are the others their sites already send.
CREATE TABLE "PublisherSub3" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublisherSub3_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PublisherSub3_token_key" ON "PublisherSub3"("token");
CREATE INDEX "PublisherSub3_publisherId_idx" ON "PublisherSub3"("publisherId");

ALTER TABLE "PublisherSub3"
  ADD CONSTRAINT "PublisherSub3_publisherId_fkey"
  FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
