-- AlterTable: loyalty / referral fields on Publisher
ALTER TABLE "Publisher" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "Publisher" ADD COLUMN "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_referralCode_key" ON "Publisher"("referralCode");

-- CreateIndex
CREATE INDEX "Publisher_referredById_idx" ON "Publisher"("referredById");

-- AddForeignKey (self-relation: who referred this affiliate)
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
