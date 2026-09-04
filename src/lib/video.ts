/**
 * Helpers for turning a pasted video link into something displayable.
 * Pure string work — no network calls, so it runs on the server and the client.
 */

/** Extracts a YouTube video id from the usual URL shapes, or null. */
export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    // https://youtu.be/<id>
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      // https://youtube.com/watch?v=<id>
      const v = parsed.searchParams.get("v");
      if (v) return v;

      // https://youtube.com/embed/<id>, /shorts/<id>, /live/<id>
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      if (match) return match[1];
    }

    return null;
  } catch {
    // Not a parseable URL — nothing to extract.
    return null;
  }
}

/** Thumbnail for a video link, or null when we can't derive one. */
export function videoThumbnail(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** Host shown under the title, e.g. "youtube.com" or "loom.com". */
export function videoHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
