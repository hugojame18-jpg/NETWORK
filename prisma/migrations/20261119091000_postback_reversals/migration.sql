-- A conversion the network takes back, and a call that is understood but
-- deliberately not counted (pending, or a decline with nothing to cancel).
ALTER TYPE "PostbackStatus" ADD VALUE IF NOT EXISTS 'REVERSED';
ALTER TYPE "PostbackStatus" ADD VALUE IF NOT EXISTS 'IGNORED';
