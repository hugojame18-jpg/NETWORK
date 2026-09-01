-- Affiliate links now follow a request/deliver flow: the publisher requests a
-- link for an offer, and the admin delivers it by pasting the real (casino)
-- tracking URL. Existing links predate this flow, so they are marked DELIVERED
-- and keep working via their internal tracking token.
CREATE TYPE "LinkStatus" AS ENUM ('REQUESTED', 'DELIVERED');

ALTER TABLE "AffiliateLink"
  ADD COLUMN "status" "LinkStatus" NOT NULL DEFAULT 'REQUESTED',
  ADD COLUMN "targetUrl" TEXT,
  ADD COLUMN "deliveredAt" TIMESTAMP(3);

UPDATE "AffiliateLink" SET "status" = 'DELIVERED', "deliveredAt" = "createdAt";
