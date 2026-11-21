import { test } from "node:test";
import assert from "node:assert/strict";
import { offerLink, renderSite } from "@/lib/sites/template";
import { siteOfferSchema, type SiteOffer } from "@/lib/validations/site-offer";

const offer: SiteOffer = {
  trackingUrl: "https://t.example.com/click?pid=1&offer_id=2&sub3=old",
  productName: "Offre test",
  summary: "Ce que tu reçois <vraiment>.",
  price: "1 €",
  recurring: "29,90 € par mois, jusqu'à résiliation",
  billedBy: "Test SAS",
  cancellation: "Depuis ton compte, en un clic",
  companyName: "Test SAS",
  contactEmail: "contact@example.com",
};

test("the sub3 replaces whatever the link already carried", () => {
  const url = new URL(offerLink(offer.trackingUrl, "abc123"));
  assert.equal(url.searchParams.get("sub3"), "abc123");
  assert.equal(url.searchParams.get("offer_id"), "2");
  assert.equal(url.searchParams.getAll("sub3").length, 1);
});

test("the page states price, recurring charge, biller and cancellation", () => {
  const html = renderSite({ headline: "Titre", sub3: "abc123" }, offer);
  for (const fact of [
    offer.price,
    "29,90 € par mois",
    offer.billedBy,
    offer.cancellation,
  ]) {
    assert.ok(html.includes(fact), fact);
  }
  assert.ok(html.indexOf("Conditions de l'offre") < html.indexOf('class="cta"'));
});

test("text from the settings or the affiliate cannot inject markup", () => {
  const html = renderSite(
    { headline: '<script>alert(1)</script>', sub3: "abc123" },
    offer,
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<vraiment>"));
  assert.ok(html.includes("&lt;vraiment&gt;"));
});

test("the offer settings are refused while any field is empty", () => {
  assert.equal(siteOfferSchema.safeParse(offer).success, true);
  assert.equal(siteOfferSchema.safeParse({ ...offer, recurring: "" }).success, false);
  assert.equal(
    siteOfferSchema.safeParse({ ...offer, trackingUrl: "http://t.example.com" }).success,
    false,
  );
});

test("the affiliate's own link is used, with the sub3, and the conditions stay", () => {
  const html = renderSite(
    { headline: "Titre", sub3: "abc123", offerUrl: "https://mon.lien/x?a=1" },
    offer,
  );
  assert.ok(html.includes("https://mon.lien/x?a=1&amp;sub3=abc123"));
  assert.ok(!html.includes("t.example.com"));
  assert.ok(html.includes("Conditions de l'offre"));
  assert.ok(html.includes(offer.cancellation));
});
