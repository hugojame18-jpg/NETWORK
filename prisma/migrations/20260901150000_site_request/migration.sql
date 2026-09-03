-- Publishers can request one of the network's ready-made promo sites. The
-- catalogue lives in code; only the requests are stored, keyed by slug.
CREATE TYPE "SiteRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "SiteRequest" (
    "id"          TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "siteSlug"    TEXT NOT NULL,
    "status"      "SiteRequestStatus" NOT NULL DEFAULT 'PENDING',
    "note"        TEXT,
    "handledAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteRequest_publisherId_siteSlug_key" ON "SiteRequest"("publisherId", "siteSlug");
CREATE INDEX "SiteRequest_status_idx" ON "SiteRequest"("status");

ALTER TABLE "SiteRequest" ADD CONSTRAINT "SiteRequest_publisherId_fkey"
    FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
