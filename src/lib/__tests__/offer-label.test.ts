import { test } from "node:test";
import assert from "node:assert/strict";
import { publicOfferLabel } from "@/lib/offer-label";

test("an offer is reduced to its country and its kind", () => {
  assert.equal(
    publicOfferLabel("BE | CC | Blank v2 (DTC) - €9.99 - Lotus [prefil]"),
    "BE · CC Submit",
  );
  assert.equal(
    publicOfferLabel("MultiGeo | CC | Ecom Modest Blank - €2 - Smarty Mother SL"),
    "MultiGeo · CC Submit",
  );
});

test("the advertiser and the price never survive", () => {
  const label = publicOfferLabel("FR | CC | Sweep iPhone - €1 - Acme Media");
  assert.ok(!label.includes("Acme"));
  assert.ok(!label.includes("€"));
  assert.ok(!label.includes("iPhone"));
});

test("a kind other than CC is kept as written", () => {
  assert.equal(publicOfferLabel("DE | SOI | Newsletter"), "DE · SOI");
});

test("a name in an unknown shape is not guessed at", () => {
  assert.equal(publicOfferLabel("Lotus Blank v2 9.99"), "Conversion");
  assert.equal(publicOfferLabel("A very long advertiser name | CC | x"), "Conversion");
  assert.equal(publicOfferLabel(""), "Conversion");
  assert.equal(publicOfferLabel(null), "Conversion");
});
