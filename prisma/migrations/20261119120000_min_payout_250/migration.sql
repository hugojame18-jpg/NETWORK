-- The network's withdrawal threshold is 250 $, not the 50 $ the column was
-- created with. Three places hold it, and all three move together so no
-- account is left on the old figure:

-- 1. the default for accounts created from now on;
ALTER TABLE "Publisher" ALTER COLUMN "minPayout" SET DEFAULT 250;

-- 2. every existing account;
UPDATE "Publisher" SET "minPayout" = 250;

-- 3. the stored setting the admin page shows and sign-up reads.
INSERT INTO "Setting" ("key", "value", "updatedAt")
VALUES ('platform', '{"minPayout": 250}'::jsonb, CURRENT_TIMESTAMP)
ON CONFLICT ("key")
DO UPDATE SET "value" = '{"minPayout": 250}'::jsonb, "updatedAt" = CURRENT_TIMESTAMP;
