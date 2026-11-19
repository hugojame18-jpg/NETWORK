import { test } from "node:test";
import assert from "node:assert/strict";
import { composeLedger } from "@/lib/ledger-math";
import { TIERS, tierBonus, tierBonusBetween } from "@/lib/loyalty";

function cents(value: number): number {
  return Math.round(value * 100);
}

test("the tiers are the ones the rewards page announces", () => {
  // The figures below are worked out by hand against these thresholds; if a
  // tier moves, these tests should be rewritten on purpose, not pass by luck.
  assert.deepEqual(
    TIERS.map((tier) => [tier.minRevenue, tier.bonusRate]),
    [
      [0, 0],
      [1_000, 0.03],
      [5_000, 0.05],
      [20_000, 0.08],
    ],
  );
});

test("nothing is owed at Bronze", () => {
  assert.equal(tierBonus(0), 0);
  assert.equal(tierBonus(999.99), 0);
  assert.equal(tierBonus(1_000), 0);
});

test("Silver pays 3 % on what is earned past the first 1 000 $", () => {
  assert.equal(cents(tierBonus(1_100)), 300);
  assert.equal(cents(tierBonus(5_000)), 12_000);
});

test("crossing a threshold is not worth a lump sum", () => {
  // One dollar past Gold earns five cents, not the hundred dollars a
  // "current rate on everything" rule would hand out.
  const justBelow = tierBonus(4_999);
  const justAbove = tierBonus(5_001);
  assert.equal(cents(justAbove - justBelow), 8);
});

test("each bracket keeps its own rate", () => {
  // 4 000 at 3 %, 15 000 at 5 %, 5 000 at 8 %.
  assert.equal(cents(tierBonus(25_000)), cents(120 + 750 + 400));
});

test("a period's bonus is the difference it made", () => {
  // A month that took someone from 800 $ to 1 500 $ earned 500 $ at Silver.
  assert.equal(cents(tierBonusBetween(800, 1_500)), 1_500);
  // Entirely inside Bronze: nothing.
  assert.equal(tierBonusBetween(100, 900), 0);
});

test("periods add up to the lifetime bonus, whatever the cut", () => {
  const cuts = [0, 640, 1_000, 3_333.33, 5_000, 12_000, 20_000, 31_000];
  let total = 0;
  for (let i = 1; i < cuts.length; i += 1) {
    total += tierBonusBetween(cuts[i - 1], cuts[i]);
  }
  assert.equal(cents(total), cents(tierBonus(31_000)));
});

test("a correction that lowers earnings never yields a negative bonus", () => {
  assert.equal(tierBonusBetween(6_000, 5_500), 0);
  assert.equal(tierBonus(-50), 0);
});

test("the bonus is part of what an affiliate is owed", () => {
  // 12 000 $ gross at 50 % is 6 000 $ of their own: 4 000 at 3 % + 1 000 at 5 %.
  const ledger = composeLedger({
    publisherId: "p",
    commissionRate: 0.5,
    isReferred: false,
    gross: 12_000,
    referredGross: 0,
    paid: 0,
    pending: 0,
  });
  assert.equal(cents(ledger.ownEarnings), 600_000);
  assert.equal(cents(ledger.tierBonus), 17_000);
  assert.equal(cents(ledger.earned), 617_000);
  assert.equal(cents(ledger.balance), 617_000);
});

test("referral rewards earn no tier bonus and do not raise the tier", () => {
  const ledger = composeLedger({
    publisherId: "p",
    commissionRate: 0.5,
    isReferred: false,
    gross: 1_000,
    referredGross: 500_000,
    paid: 0,
    pending: 0,
  });
  // 500 $ of their own: still Bronze, whatever their referrals bring in.
  assert.equal(ledger.tierBonus, 0);
  assert.equal(cents(ledger.earned), cents(500 + 50_000));
});
