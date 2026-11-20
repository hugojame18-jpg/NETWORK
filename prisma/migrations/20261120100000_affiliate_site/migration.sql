-- A site an affiliate generated from the network's template, with its own sub3.
CREATE TABLE "AffiliateSite" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sub3" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "netlifySiteId" TEXT,
    "netlifyHost" TEXT,
    "domain" TEXT,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateSite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AffiliateSite_sub3_key" ON "AffiliateSite"("sub3");
CREATE INDEX "AffiliateSite_publisherId_idx" ON "AffiliateSite"("publisherId");

ALTER TABLE "AffiliateSite" ADD CONSTRAINT "AffiliateSite_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
