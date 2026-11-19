import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareWindows,
  conversionRate,
  pctChange,
  progressToward,
  sumWindow,
  tail,
} from "@/lib/trend";

const series = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => ({ value }));
const pick = (point: { value: number }) => point.value;

test("a window sums the most recent points", () => {
  assert.equal(sumWindow(series, pick, 3), 8 + 9 + 10);
  assert.equal(sumWindow(series, pick, 10), 55);
});

test("a skipped window is the one just before", () => {
  assert.equal(sumWindow(series, pick, 3, 3), 5 + 6 + 7);
});

test("a window longer than the series takes what there is", () => {
  assert.equal(sumWindow(series, pick, 50), 55);
  assert.equal(sumWindow(series, pick, 5, 8), 1 + 2);
  assert.equal(sumWindow([], pick, 7), 0);
});

test("two windows are compared like for like", () => {
  const result = compareWindows(series, pick, 3);
  assert.equal(result.current, 27);
  assert.equal(result.previous, 18);
  assert.equal(result.delta, 50);
});

test("a drop is a negative change", () => {
  assert.equal(pctChange(50, 200), -75);
});

test("growth from nothing has no percentage", () => {
  // Not +100 %, not infinity: there is no honest number here.
  assert.equal(pctChange(120, 0), null);
  assert.equal(pctChange(0, 0), null);
});

test("a fall to zero is a full loss, not a missing figure", () => {
  assert.equal(pctChange(0, 80), -100);
});

test("a series too short to have a previous window shows no delta", () => {
  const short = [{ value: 4 }, { value: 6 }];
  assert.equal(compareWindows(short, pick, 7).delta, null);
});

test("conversion rate is a percentage and survives zero clicks", () => {
  assert.equal(conversionRate(11, 550), 2);
  assert.equal(conversionRate(3, 0), 0);
});

test("progress toward the payout threshold is clamped", () => {
  assert.equal(progressToward(165, 250), 0.66);
  assert.equal(progressToward(400, 250), 1);
  assert.equal(progressToward(-30, 250), 0);
  assert.equal(progressToward(10, 0), 1);
});

test("tail returns the end of a series", () => {
  assert.deepEqual(tail([1, 2, 3, 4], 2), [3, 4]);
  assert.deepEqual(tail([1, 2], 5), [1, 2]);
  assert.deepEqual(tail([1, 2], 0), []);
});
