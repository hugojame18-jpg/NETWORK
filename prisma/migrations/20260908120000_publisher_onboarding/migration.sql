-- Marks when a publisher finished or skipped the first-run guided tour, so it
-- shows once per account instead of once per browser. Existing publishers are
-- treated as already onboarded: the tour is for newcomers, not a surprise for
-- people already using the dashboard.
ALTER TABLE "Publisher" ADD COLUMN "onboardingSeenAt" TIMESTAMP(3);

UPDATE "Publisher" SET "onboardingSeenAt" = now();
