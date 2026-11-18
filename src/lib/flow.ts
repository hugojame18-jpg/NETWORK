import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Pulling clicks and hosts from the upstream network (Flow Network, which runs
 * on Affise) so nobody has to type them in every evening.
 *
 * Only traffic is taken from here. Conversions and revenue keep coming from
 * the global postback, which is immediate — reconciling two sources for the
 * same figure would mean one of them is silently wrong half the time.
 */

const KEY_SETTING = "flow.apiKey";
const URL_SETTING = "flow.apiUrl";
const LAST_SYNC_SETTING = "flow.lastSync";

/** Flow's own API host. Stored, not hard-coded, so another network can be pointed at. */
const DEFAULT_API_URL = "https://api-flownetwork.affise.com";

/** How many days back each run re-reads. Traffic for a day keeps moving for a
 * while after it ends — late clicks, the network's own corrections — so the
 * last few days are rewritten rather than written once and trusted. */
const WINDOW_DAYS = 3;

export interface FlowConfig {
  apiKey: string | null;
  apiUrl: string;
}

export interface SyncSummary {
  ranAt: string;
  ok: boolean;
  /** Days × affiliates written. */
  rowsWritten: number;
  /** sub3 values Flow reported that match no affiliate here. */
  unknownSub3: string[];
  from: string;
  to: string;
  error?: string;
}

async function readSetting<T>(key: string): Promise<T | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? (row.value as T) : null;
}

async function writeSetting(key: string, value: unknown) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: value as never },
    update: { value: value as never },
  });
}

export async function flowConfig(): Promise<FlowConfig> {
  const [apiKey, apiUrl] = await Promise.all([
    readSetting<string>(KEY_SETTING),
    readSetting<string>(URL_SETTING),
  ]);
  return {
    apiKey: typeof apiKey === "string" && apiKey.length > 0 ? apiKey : null,
    apiUrl:
      typeof apiUrl === "string" && apiUrl.length > 0 ? apiUrl : DEFAULT_API_URL,
  };
}

export async function saveFlowConfig(apiKey: string, apiUrl?: string) {
  await writeSetting(KEY_SETTING, apiKey);
  if (apiUrl) await writeSetting(URL_SETTING, apiUrl.replace(/\/+$/, ""));
}

export async function lastSync(): Promise<SyncSummary | null> {
  return readSetting<SyncSummary>(LAST_SYNC_SETTING);
}

// ---------------------------------------------------------------------------
// The API call
// ---------------------------------------------------------------------------

interface CustomStatRow {
  slice?: {
    year?: number;
    month?: number;
    day?: number;
    sub3?: string | null;
  };
  traffic?: { raw?: string | number; uniq?: string | number };
  clicks?: string | number;
  hosts?: string | number;
}

interface CustomStatsResponse {
  status?: number;
  stats?: CustomStatRow[];
  pagination?: { page?: number; total_count?: number; per_page?: number };
  error?: string;
  message?: string;
}

function toInt(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Traffic per day per sub3 over a date range.
 *
 * Asked for in UTC explicitly: the postback books a conversion against the UTC
 * day, and a dashboard where the clicks and the conversions sit on different
 * sides of midnight is worse than no clicks at all.
 */
async function fetchTraffic(
  config: FlowConfig,
  from: string,
  to: string,
): Promise<CustomStatRow[]> {
  const rows: CustomStatRow[] = [];

  for (let page = 1; page <= 20; page += 1) {
    const url = new URL(`${config.apiUrl}/3.0/stats/custom`);
    url.searchParams.append("slice[]", "day");
    url.searchParams.append("slice[]", "sub3");
    url.searchParams.append("fields[]", "clicks");
    url.searchParams.append("fields[]", "hosts");
    url.searchParams.set("filter[date_from]", from);
    url.searchParams.set("filter[date_to]", to);
    url.searchParams.set("timezone", "UTC");
    url.searchParams.set("limit", "500");
    url.searchParams.set("page", String(page));

    const response = await fetch(url, {
      headers: { "API-Key": config.apiKey ?? "" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Flow a répondu ${response.status}. Vérifie la clé API et l'URL.`,
      );
    }

    const body = (await response.json()) as CustomStatsResponse;
    if (body.status !== 1) {
      throw new Error(
        body.error ?? body.message ?? "Flow a refusé la requête.",
      );
    }

    const batch = body.stats ?? [];
    rows.push(...batch);

    const perPage = body.pagination?.per_page ?? batch.length;
    const total = body.pagination?.total_count ?? rows.length;
    if (rows.length >= total || batch.length === 0 || perPage === 0) break;
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Writing it back
// ---------------------------------------------------------------------------

/**
 * Reads the last few days from Flow and writes traffic onto the matching
 * affiliate's day.
 *
 * Clicks and hosts are overwritten rather than incremented: Flow is the
 * authority on traffic, and a re-run of the same day must land on the same
 * number instead of doubling it.
 */
export async function syncFlowTraffic(): Promise<SyncSummary> {
  const now = new Date();
  const to = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const from = new Date(to.getTime() - (WINDOW_DAYS - 1) * 86_400_000);

  const summary: SyncSummary = {
    ranAt: new Date().toISOString(),
    ok: false,
    rowsWritten: 0,
    unknownSub3: [],
    from: isoDay(from),
    to: isoDay(to),
  };

  try {
    const config = await flowConfig();
    if (!config.apiKey) {
      throw new Error("Aucune clé API Flow enregistrée.");
    }

    const [rows, publishers] = await Promise.all([
      fetchTraffic(config, summary.from, summary.to),
      prisma.publisher.findMany({
        where: { postbackToken: { not: null } },
        select: { id: true, postbackToken: true },
      }),
    ]);

    const byToken = new Map(
      publishers.map((p) => [p.postbackToken!.toLowerCase(), p.id]),
    );
    const unknown = new Set<string>();

    for (const row of rows) {
      const sub3 = row.slice?.sub3?.trim().toLowerCase();
      const { year, month, day } = row.slice ?? {};
      if (!sub3 || !year || !month || !day) continue;

      const publisherId = byToken.get(sub3);
      if (!publisherId) {
        unknown.add(sub3);
        continue;
      }

      const clicks = toInt(row.clicks ?? row.traffic?.raw);
      const hosts = toInt(row.hosts ?? row.traffic?.uniq);
      const date = new Date(Date.UTC(year, month - 1, day));

      await prisma.publisherDailyStat.upsert({
        where: { publisherId_date: { publisherId, date } },
        create: {
          publisherId,
          date,
          clicks,
          hosts,
          conversions: 0,
          revenue: 0,
        },
        // Conversions and revenue are the postback's to own — a traffic sync
        // must never reach across and touch the money.
        update: { clicks, hosts },
      });
      summary.rowsWritten += 1;
    }

    summary.unknownSub3 = [...unknown].slice(0, 20);
    summary.ok = true;
  } catch (error) {
    summary.error =
      error instanceof Error ? error.message : "Erreur inconnue.";
  }

  await writeSetting(LAST_SYNC_SETTING, summary);
  return summary;
}
