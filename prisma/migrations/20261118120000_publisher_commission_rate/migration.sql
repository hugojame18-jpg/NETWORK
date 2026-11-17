-- Revenue is now split between the network and the affiliate.
-- PublisherDailyStat.revenue holds the gross amount the advertiser pays; the
-- affiliate earns that times commissionRate. 0.5 is the network's standard
-- 50/50 deal, and the column is per-affiliate so individual terms can differ.
ALTER TABLE "Publisher"
  ADD COLUMN "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.5;

-- Sign-up is open: new publishers are approved on creation, and existing
-- pending accounts are let in rather than left stranded behind a gate that no
-- longer has a review process behind it.
ALTER TABLE "Publisher" ALTER COLUMN "applicationStatus" SET DEFAULT 'APPROVED';
UPDATE "Publisher" SET "applicationStatus" = 'APPROVED' WHERE "applicationStatus" = 'PENDING';
