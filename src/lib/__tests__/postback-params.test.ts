import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AMOUNT_PARAMS,
  SUB3_PARAMS,
  bookingDay,
  conversionState,
  normalizeSub3,
  parseAmount,
  pickParam,
  withSub3,
} from "@/lib/postback-params";

test("an amount is read however the network chose to write it", () => {
  assert.equal(parseAmount("30"), 30);
  assert.equal(parseAmount("30.00"), 30);
  assert.equal(parseAmount("30,50"), 30.5);
  assert.equal(parseAmount("$30"), 30);
  assert.equal(parseAmount("€9.99"), 9.99);
});

test("a missing or unreadable amount is null, never a silent zero", () => {
  assert.equal(parseAmount(null), null);
  assert.equal(parseAmount(""), null);
  assert.equal(parseAmount("{sum}"), null, "an unfilled macro is not money");
});

test("the amount is found under any of the names networks use", () => {
  for (const name of AMOUNT_PARAMS) {
    const params = new URLSearchParams({ [name]: "12" });
    assert.equal(pickParam(params, AMOUNT_PARAMS), "12", name);
  }
});

test("an empty parameter is skipped in favour of the next name", () => {
  const params = new URLSearchParams({ sub3: "  ", s3: "slime" });
  assert.equal(pickParam(params, SUB3_PARAMS), "slime");
});

test("no status means approved, as the first URL handed out carried none", () => {
  assert.equal(conversionState(null), "approved");
  assert.equal(conversionState(""), "approved");
});

test("Affise's numeric statuses are understood", () => {
  assert.equal(conversionState("1"), "approved");
  assert.equal(conversionState("2"), "pending");
  assert.equal(conversionState("3"), "declined");
  assert.equal(conversionState("5"), "pending");
});

test("worded statuses are understood in any case", () => {
  assert.equal(conversionState("Approved"), "approved");
  assert.equal(conversionState("DECLINED"), "declined");
  assert.equal(conversionState("rejected"), "declined");
  assert.equal(conversionState("chargeback"), "declined");
  assert.equal(conversionState("hold"), "pending");
});

test("a status nobody has seen is never treated as a sale", () => {
  assert.equal(conversionState("4"), "unknown");
  assert.equal(conversionState("maybe"), "unknown");
});

test("an unfilled status macro is read as no status, not as a refusal", () => {
  // If the network does not know the macro, every call carries the literal
  // text. Treating that as unknown would stop counting conversions entirely.
  assert.equal(conversionState("{status}"), "approved");
});

test("a sub3 is compared without regard to case or stray spaces", () => {
  assert.equal(normalizeSub3("Slime"), "slime");
  assert.equal(normalizeSub3("  TR "), "tr");
  assert.equal(normalizeSub3(""), null);
  assert.equal(normalizeSub3(null), null);
});

test("a sub3 with a typo in it stays a different sub3", () => {
  // The network treats "slime`" and "slime" as two values, so this must too:
  // it gets attached as it stands, not merged by a guess.
  assert.notEqual(normalizeSub3("slime`"), normalizeSub3("slime"));
});

test("a delivered link carries the affiliate's sub3", () => {
  assert.equal(
    withSub3("https://offer.example/go?aff=1", "slime"),
    "https://offer.example/go?aff=1&sub3=slime",
  );
});

test("a sub3 already written on the link is left alone", () => {
  const url = "https://offer.example/go?sub3=custom";
  assert.equal(withSub3(url, "slime"), url);
});

test("a link that is not a URL is handed back untouched", () => {
  assert.equal(withSub3("not a url", "slime"), "not a url");
  assert.equal(withSub3("https://offer.example/go", null), "https://offer.example/go");
});

test("a conversion is booked on the day it arrived, at UTC midnight", () => {
  const arrived = new Date(2026, 10, 18, 23, 59, 30);
  const day = bookingDay(arrived);
  assert.equal(day.toISOString(), "2026-11-18T00:00:00.000Z");
});
