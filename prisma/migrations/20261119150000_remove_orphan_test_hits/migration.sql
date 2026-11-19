-- Test postbacks fired from the admin's "test" button were counted on an
-- affiliate's day like any other. When every account was reset to zero, the
-- daily figures were deleted but the journal rows were not, so an affiliate's
-- list of conversions showed one more sale than their statistics did.
--
-- This removes those leftovers and nothing else. A test call is deleted only
-- where the journal holds more counted conversions for that affiliate and day
-- than the statistics do — that is, where the row is provably no longer
-- backed by a figure. A test call that is still counted in the statistics is
-- left alone, since deleting it would leave the figure with nothing behind it.
DELETE FROM "PostbackHit" h
WHERE h."transactionId" LIKE 'test-%'
  AND h."status" = 'ACCEPTED'
  AND h."publisherId" IS NOT NULL
  AND (
    SELECT COUNT(*)
    FROM "PostbackHit" o
    WHERE o."publisherId" = h."publisherId"
      AND o."status" = 'ACCEPTED'
      AND o."createdAt"::date = h."createdAt"::date
  ) > COALESCE((
    SELECT s."conversions"
    FROM "PublisherDailyStat" s
    WHERE s."publisherId" = h."publisherId"
      AND s."date" = h."createdAt"::date
  ), 0);
