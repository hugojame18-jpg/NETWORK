import Link from "next/link";
import { Clock, XCircle, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "@/components/brand/mascot";
import { emailDeliveryEnabled } from "@/lib/email";

/**
 * Shown in place of the whole publisher dashboard while an application is
 * still being reviewed (or after it was turned down). Deliberately has no
 * sidebar or navigation: there is nothing to browse yet.
 */
export function ApplicationPending({
  name,
  rejected,
}: {
  name: string;
  rejected?: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-5 pt-8 pb-8 text-center">
          <div className="relative mx-auto w-fit">
            <Mascot className="h-24 w-24" />
            <span
              className={`absolute -right-2 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-sm ${
                rejected ? "text-destructive" : "text-primary"
              }`}
            >
              {rejected ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </span>
          </div>

          {rejected ? (
            <>
              <h1 className="text-xl font-semibold">Candidature non retenue</h1>
              <p className="text-sm text-muted-foreground">
                Merci pour ton intérêt, {name}. Ta candidature n&apos;a pas été
                retenue cette fois-ci. Si tu penses qu&apos;il s&apos;agit
                d&apos;une erreur, écris à{" "}
                <a
                  href="https://t.me/solangerev"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  @solangerev
                </a>{" "}
                sur Telegram et nous la réexaminerons.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                Ta candidature est en attente
              </h1>
              <p className="text-sm text-muted-foreground">
                Merci {name}&nbsp;! Ton compte est créé et nous étudions ta
                candidature. Nous vérifions ton expérience en affiliation et tes
                contenus TikTok avant d&apos;ouvrir l&apos;accès.
              </p>
              <p className="text-sm text-muted-foreground">
                {/* Only promise an email when one can actually be sent. */}
                {emailDeliveryEnabled()
                  ? "Tu recevras un email dès qu'elle est validée : "
                  : "Dès qu'elle est validée, "}
                ton dashboard, les offres et les sites à promouvoir seront
                accessibles.
              </p>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="font-medium">Pour accélérer ta validation</p>
                <p className="mt-1 text-muted-foreground">
                  Envoie un message à{" "}
                  <a
                    href="https://t.me/solangerev"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    @solangerev
                  </a>{" "}
                  sur Telegram en précisant ton adresse email.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-center pt-2">
            <Link
              href="/api/auth/signout"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
