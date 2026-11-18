interface ApplicationDetailsProps {
  workedWithNetworks: boolean;
  previousNetworks: string | null;
  affiliateExperience: string | null;
  tiktokLinks: string | null;
  website: string | null;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap">
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}

/**
 * The sign-up questionnaire, inline under the publisher's name. A plain
 * <details> disclosure rather than a modal: it needs no client JS, so it works
 * even in a server-rendered table row.
 *
 * It is what the affiliate told us, not something awaiting a decision — there
 * is no approval step — so it is labelled as information, not a candidature.
 */
export function ApplicationDetails(props: ApplicationDetailsProps) {
  return (
    <details className="mt-1">
      <summary className="w-fit cursor-pointer text-xs text-primary hover:underline">
        Ce qu'il a déclaré à l'inscription
      </summary>
      <div className="mt-2 max-w-md space-y-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
        <Field
          label="A déjà travaillé avec d'autres réseaux"
          value={props.workedWithNetworks ? "Oui" : "Non"}
        />
        {props.workedWithNetworks && (
          <Field label="Réseaux cités" value={props.previousNetworks} />
        )}
        <Field
          label="Activité en affiliation"
          value={props.affiliateExperience}
        />
        <Field label="Posts / comptes TikTok" value={props.tiktokLinks} />
        <Field label="Site web" value={props.website} />
      </div>
    </details>
  );
}
