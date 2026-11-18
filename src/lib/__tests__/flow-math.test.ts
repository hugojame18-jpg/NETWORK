import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateTraffic, type TrafficRow } from "@/lib/flow-math";

const from = new Date(Date.UTC(2026, 10, 16));
const to = new Date(Date.UTC(2026, 10, 18));

const directory = new Map([
  ["slime", "kiren"],
  ["lujelly", "kiren"],
  ["tr", "kiren"],
  ["other", "someone-else"],
]);

function total(
  rows: TrafficRow[],
  publisherId: string,
  isoDay: string,
): { clicks: number; hosts: number } | undefined {
  const { totals } = aggregateTraffic(rows, directory, from, to);
  const match = totals.find(
    (t) =>
      t.publisherId === publisherId &&
      t.date.toISOString().slice(0, 10) === isoDay,
  );
  return match && { clicks: match.clicks, hosts: match.hosts };
}

test("a row that arrives with the day number alone is still placed", () => {
  // Exactly what Flow sent the first time: no year, no month. The sync
  // dropped all thirteen rows and reported a success.
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "slime" }, clicks: "27", hosts: "16" },
  ];
  assert.deepEqual(total(rows, "kiren", "2026-11-16"), {
    clicks: 27,
    hosts: 16,
  });
});

test("a full date is used as given", () => {
  const rows: TrafficRow[] = [
    {
      slice: { year: 2026, month: 11, day: 18, sub3: "slime" },
      clicks: 5,
      hosts: 3,
    },
  ];
  assert.deepEqual(total(rows, "kiren", "2026-11-18"), { clicks: 5, hosts: 3 });
});

test("several sub3 of one affiliate add up on the same day", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 17, sub3: "slime" }, clicks: 10, hosts: 6 },
    { slice: { day: 17, sub3: "lujelly" }, clicks: 20, hosts: 9 },
  ];
  assert.deepEqual(total(rows, "kiren", "2026-11-17"), {
    clicks: 30,
    hosts: 15,
  });
});

test("the same sub3 in two spellings is one value, summed", () => {
  // Flow reports "TR" and "Tr" as separate rows. Written one after the
  // other, the second used to overwrite the first.
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "TR" }, clicks: 4, hosts: 4 },
    { slice: { day: 16, sub3: "Tr" }, clicks: 7, hosts: 5 },
  ];
  assert.deepEqual(total(rows, "kiren", "2026-11-16"), {
    clicks: 11,
    hosts: 9,
  });
});

test("each affiliate and each day gets its own total", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "slime" }, clicks: 1, hosts: 1 },
    { slice: { day: 17, sub3: "slime" }, clicks: 2, hosts: 2 },
    { slice: { day: 17, sub3: "other" }, clicks: 50, hosts: 40 },
  ];
  const { totals } = aggregateTraffic(rows, directory, from, to);
  assert.equal(totals.length, 3);
  assert.deepEqual(total(rows, "someone-else", "2026-11-17"), {
    clicks: 50,
    hosts: 40,
  });
});

test("traffic under a sub3 nobody owns is reported, not dropped in silence", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "squish" }, clicks: 9, hosts: 7 },
    { slice: { day: 16, sub3: "slime`" }, clicks: 3, hosts: 3 },
    { slice: { day: 16, sub3: "slime" }, clicks: 1, hosts: 1 },
  ];
  const { unknown, totals } = aggregateTraffic(rows, directory, from, to);
  assert.deepEqual(unknown, ["slime`", "squish"]);
  assert.equal(totals.length, 1);
});

test("an unknown sub3 with no traffic on it is not worth a warning", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "ghost" }, clicks: 0, hosts: 0 },
  ];
  assert.deepEqual(aggregateTraffic(rows, directory, from, to).unknown, []);
});

test("rows with no sub3 or no day cannot be attributed and are skipped", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "" }, clicks: 100, hosts: 100 },
    { slice: { day: 16, sub3: null }, clicks: 100, hosts: 100 },
    { slice: { sub3: "slime" }, clicks: 100, hosts: 100 },
    {},
  ];
  const { totals, unknown } = aggregateTraffic(rows, directory, from, to);
  assert.equal(totals.length, 0);
  assert.equal(unknown.length, 0);
});

test("a bare day number outside the window is not guessed at", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 3, sub3: "slime" }, clicks: 8, hosts: 8 },
  ];
  assert.equal(aggregateTraffic(rows, directory, from, to).totals.length, 0);
});

test("counts are read from the nested shape Affise also uses", () => {
  const rows: TrafficRow[] = [
    { slice: { day: 16, sub3: "slime" }, traffic: { raw: "12", uniq: "8" } },
  ];
  assert.deepEqual(total(rows, "kiren", "2026-11-16"), { clicks: 12, hosts: 8 });
});
