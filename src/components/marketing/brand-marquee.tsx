/**
 * The brand, said in six words, running across the page.
 *
 * Every phrase is something the product does — the band is a summary, not a
 * slogan generator. Filled and outlined words alternate so it reads as
 * texture from a distance and as a list up close. The content is duplicated
 * once so the loop has no seam; the copy is hidden from screen readers.
 */
const WORDS = [
  "Payé à la conversion",
  "Conversions en direct",
  "Solde toujours à jour",
  "Parrainage 10 %",
  "Formation incluse",
  "Une équipe sur Telegram",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {WORDS.map((word, index) => (
        <span key={word} className="flex items-center">
          <span
            className={
              index % 2 === 0
                ? "display px-7 text-3xl whitespace-nowrap uppercase sm:text-5xl"
                : "display text-outline px-7 text-3xl whitespace-nowrap uppercase sm:text-5xl"
            }
          >
            {word}
          </span>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal sm:h-3 sm:w-3" />
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  return (
    <div className="marquee-group overflow-hidden border-y border-white/8 py-7 sm:py-9">
      <div
        className="animate-marquee flex w-max"
        style={{ animationDuration: "46s" }}
      >
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
