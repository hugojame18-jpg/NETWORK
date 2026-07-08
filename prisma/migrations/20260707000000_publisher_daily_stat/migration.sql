-- CreateTable
CREATE TABLE "PublisherDailyStat" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "hosts" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublisherDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublisherDailyStat_publisherId_date_idx" ON "PublisherDailyStat"("publisherId", "date");

-- CreateIndex
CREATE INDEX "PublisherDailyStat_date_idx" ON "PublisherDailyStat"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PublisherDailyStat_publisherId_date_key" ON "PublisherDailyStat"("publisherId", "date");

-- AddForeignKey
ALTER TABLE "PublisherDailyStat" ADD CONSTRAINT "PublisherDailyStat_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublisherDailyStat" ADD CONSTRAINT "PublisherDailyStat_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

