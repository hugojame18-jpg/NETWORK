import { rateLimit } from "./rate-limit";

const BOT_UA_PATTERN = /bot|crawler|spider|headless|curl|wget|python-requests|scrapy|phantomjs/i;

export function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent) return true;
  return BOT_UA_PATTERN.test(userAgent);
}

/**
 * Flags rapid repeat clicks from the same visitor on the same link as
 * suspicious (e.g. reload spam, click-bots). The click is still recorded —
 * fraud detection here is about excluding it from stats/commissions, not
 * about blocking traffic outright.
 */
export async function isRapidDuplicateClick(linkId: string, ipHash: string): Promise<boolean> {
  const result = await rateLimit(`click-dedup:${linkId}:${ipHash}`, { limit: 1, windowSeconds: 30 });
  return !result.success;
}

/** Per-IP click throttling, independent of which link is being clicked. */
export async function isClickFloodFromIp(ipHash: string): Promise<boolean> {
  const result = await rateLimit(`click-flood:${ipHash}`, { limit: 60, windowSeconds: 60 });
  return !result.success;
}
