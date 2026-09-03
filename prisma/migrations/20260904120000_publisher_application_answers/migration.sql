-- Application questionnaire answered at sign-up and reviewed by an admin
-- before the publisher dashboard unlocks. All nullable/defaulted so existing
-- publishers stay valid; their answers are simply empty.
ALTER TABLE "Publisher"
  ADD COLUMN "workedWithNetworks"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "previousNetworks"    TEXT,
  ADD COLUMN "affiliateExperience" TEXT,
  ADD COLUMN "tiktokLinks"         TEXT;
