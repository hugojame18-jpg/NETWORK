-- Admin-written messages shown on every publisher's dashboard while active.
CREATE TABLE "Announcement" (
    "id"        TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "body"      TEXT NOT NULL,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "authorId"  TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Announcement_active_createdAt_idx" ON "Announcement"("active", "createdAt");

-- SET NULL: deleting the admin account keeps the message readable.
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
