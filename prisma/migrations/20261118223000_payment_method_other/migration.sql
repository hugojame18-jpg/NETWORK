-- An admin recording a payout that was already sent must be able to name the
-- channel used. The four existing methods cover what publishers can choose;
-- OTHER covers everything the network actually pays with (Revolut, Wise, cash).
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'OTHER';
