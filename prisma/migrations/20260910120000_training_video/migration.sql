-- Training videos published by admins for publishers. Only the link is kept;
-- the video stays hosted wherever it was uploaded.
CREATE TABLE "TrainingVideo" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "url"         TEXT NOT NULL,
    "active"      BOOLEAN NOT NULL DEFAULT true,
    "position"    INTEGER NOT NULL DEFAULT 0,
    "authorId"    TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingVideo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrainingVideo_active_position_idx" ON "TrainingVideo"("active", "position");

-- SET NULL: deleting the admin account keeps the lesson available.
ALTER TABLE "TrainingVideo" ADD CONSTRAINT "TrainingVideo_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
