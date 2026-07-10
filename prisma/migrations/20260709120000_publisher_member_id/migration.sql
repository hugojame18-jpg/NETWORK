-- Sequential, human-readable affiliate number on Publisher, starting at 1000.
-- Existing publishers are backfilled in creation order; new ones continue the
-- sequence. The sequence name matches Prisma's `@default(autoincrement())`
-- convention (Table_column_seq) so the generated client uses it.
CREATE SEQUENCE "Publisher_memberId_seq" START WITH 1000;

ALTER TABLE "Publisher"
  ADD COLUMN "memberId" INTEGER NOT NULL DEFAULT nextval('"Publisher_memberId_seq"');

ALTER SEQUENCE "Publisher_memberId_seq" OWNED BY "Publisher"."memberId";

CREATE UNIQUE INDEX "Publisher_memberId_key" ON "Publisher"("memberId");
