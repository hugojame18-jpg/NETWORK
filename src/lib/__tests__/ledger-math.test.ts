import { test } from "node:test";
import assert from "node:assert/strict";
import {
  composeLedger,
  emptyLedger,
  splitPayments,
} from "@/lib/ledger-math";
import { REFERRAL_RATE, payoutRate } from "@/lib/loyalty";

/** Money is compared to the cent: floats may differ in the 15th decimal. */
function cents(value: number): number {
  return Math.round(value * 100);
}

const base = {
  publisherId: "p1",
  commissionRate: 0.5,
  isReferred: false,
  gross: 0,
  referredGross: 0,
  paid: 0,
  pending: 0,
};

test("an affiliate on 50 % keeps half of the gross", () => {
  // The case this module was written for: 330 $ billed, 165 $ theirs.
  const ledger = composeLedger({ ...base, gross: 330 });
  assert.equal(cents(ledger.ownEarnings), 16500);
  assert.equal(cents(ledger.earned), 16500);
  assert.equal(cents(ledger.balance), 16500);
});

test("a payout draws the balance down and leaves the earnings alone", () => {
  const ledger = composeLedger({ ...base, gross: 2000, paid: 1000 });
  assert.equal(cents(ledger.balance), 0);
  // What they earned is history; paying them does not rewrite it.
  assert.equal(cents(ledger.earned), 100000);
  assert.equal(cents(ledger.gross), 200000);
});

test("a partial payout leaves the rest owed", () => {
  const ledger = composeLedger({ ...base, gross: 330, paid: 100 });
  assert.equal(cents(ledger.balance), 6500);
});

test("paying more than was earned shows as a negative balance", () => {
  // Not clamped: an advance has to stay visible until earnings catch up.
  const ledger = composeLedger({ ...base, gross: 100, paid: 80 });
  assert.equal(cents(ledger.balance), -3000);
  // But nothing can be requested against a debt.
  assert.equal(ledger.available, 0);
});

test("a referred affiliate gives up the referral share, not the network", () => {
  // 30 $ gross on 50 %: network keeps 15, sponsor takes 3, affiliate 12.
  const referred = composeLedger({ ...base, isReferred: true, gross: 30 });
  assert.equal(cents(referred.ownEarnings), 1200);

  const sponsor = composeLedger({ ...base, referredGross: 30 });
  assert.equal(cents(sponsor.referralEarnings), 300);

  const paidOut = referred.ownEarnings + sponsor.referralEarnings;
  assert.equal(cents(paidOut), 1500, "the network's half is untouched");
});

test("a sponsor's balance includes what their referrals earned them", () => {
  const ledger = composeLedger({ ...base, gross: 100, referredGross: 1000 });
  assert.equal(cents(ledger.ownEarnings), 5000);
  assert.equal(cents(ledger.referralEarnings), 100000 * REFERRAL_RATE);
  assert.equal(cents(ledger.balance), 15000);
});

test("an affiliate on terms below the referral rate never goes negative", () => {
  assert.equal(payoutRate(0.05, true), 0);
  const ledger = composeLedger({
    ...base,
    commissionRate: 0.05,
    isReferred: true,
    gross: 500,
  });
  assert.equal(ledger.ownEarnings, 0);
});

test("a pending request reduces what can still be asked for, not what is owed", () => {
  const ledger = composeLedger({ ...base, gross: 400, pending: 150 });
  assert.equal(cents(ledger.balance), 20000);
  assert.equal(cents(ledger.available), 5000);
});

test("payments are split by what actually happened to the money", () => {
  const { paid, pending } = splitPayments([
    { status: "PAID", amount: 100 },
    { status: "PAID", amount: 50 },
    { status: "PENDING", amount: 30 },
    { status: "APPROVED", amount: 20 },
    { status: "REJECTED", amount: 999 },
  ]);
  assert.equal(paid, 150);
  assert.equal(pending, 50);
});

test("a new account owes and is owed nothing", () => {
  const ledger = emptyLedger("new");
  assert.equal(ledger.balance, 0);
  assert.equal(ledger.earned, 0);
  assert.equal(ledger.available, 0);
});
