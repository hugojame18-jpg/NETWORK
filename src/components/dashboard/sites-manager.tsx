"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Globe, Loader2, Plus, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface SiteRow {
  id: string;
  name: string;
  headline: string;
  sub3: string;
  netlifySiteId: string | null;
  netlifyHost: string | null;
  domain: string | null;
  deployed: boolean;
}

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Une erreur est survenue.");
  return json;
}

export function CreateSiteForm({ open }: { open: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await call("/api/publisher/sites", "POST", { name, headline });
        toast.success("Site généré, avec son sub3 à lui.");
        setName("");
        setHeadline("");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="surface space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="site-name">Nom du site (pour toi)</Label>
          <Input
            id="site-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Site TikTok 1"
            disabled={!open}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-headline">Titre affiché aux visiteurs</Label>
          <Input
            id="site-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            disabled={!open}
          />
        </div>
      </div>
      <Button type="submit" disabled={!open || isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Générer le mien
      </Button>
      {!open && (
        <p className="text-sm text-muted-foreground">
          Les sites ne sont pas encore ouverts. Ils le seront dès que l&apos;équipe aura renseigné les
          conditions de l&apos;offre.
        </p>
      )}
    </form>
  );
}

export function SiteCard({
  site,
  hosting,
}: {
  site: SiteRow;
  hosting: boolean;
}) {
  const router = useRouter();
  const [headline, setHeadline] = useState(site.headline);
  const [domain, setDomain] = useState(site.domain ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const suggestion = site.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
  const namecheap = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(
    domain || `${suggestion || "monsite"}.site`,
  )}`;

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const saveHeadline = () =>
    run("headline", async () => {
      await call(`/api/publisher/sites/${site.id}`, "PATCH", { headline });
      toast.success(
        site.deployed ? "Titre enregistré. Remets le site en ligne pour l'appliquer." : "Titre enregistré.",
      );
    });

  const deploy = () =>
    run("deploy", async () => {
      const json = await call(`/api/publisher/sites/${site.id}/deploy`, "POST");
      toast.success(`En ligne : ${json.host}`);
    });

  const attach = () =>
    run("domain", async () => {
      await call(`/api/publisher/sites/${site.id}/domain`, "PUT", { domain });
      toast.success("Domaine relié. Termine la configuration chez Namecheap (étapes ci-dessous).");
    });

  const liveHost = site.domain ?? site.netlifyHost;

  return (
    <div className="surface space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{site.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            sub3 <code>{site.sub3}</code> · les ventes de ce site sont comptées pour toi
          </p>
        </div>
        {site.deployed && liveHost ? (
          <a
            href={`https://${liveHost}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-signal hover:underline"
          >
            <Badge variant="secondary">En ligne</Badge>
            {liveHost}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Badge variant="outline">Pas en ligne</Badge>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`h-${site.id}`}>Titre affiché aux visiteurs</Label>
        <div className="flex gap-2">
          <Input id={`h-${site.id}`} value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <Button
            variant="outline"
            onClick={saveHeadline}
            disabled={busy !== null || headline.trim() === site.headline}
          >
            {busy === "headline" && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Le reste de la page (offre, prix, prélèvements, résiliation) est fixé par l&apos;équipe et
          ne se modifie pas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" render={<a href={`/api/publisher/sites/${site.id}/download`} />}>
          <Download className="h-4 w-4" />
          Télécharger (.zip)
        </Button>
        {hosting ? (
          <Button onClick={deploy} disabled={busy !== null}>
            {busy === "deploy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            {site.deployed ? "Mettre à jour en ligne" : "Mettre en ligne"}
          </Button>
        ) : (
          <Button
            variant="outline"
            render={<a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" />}
          >
            <ExternalLink className="h-4 w-4" />
            Déposer sur Netlify
          </Button>
        )}
      </div>

      {hosting && site.netlifySiteId && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" /> Ton nom de domaine
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Achète un <strong>.site</strong> chez Namecheap (quelques euros la première année) :{" "}
              <a
                href={namecheap}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal hover:underline"
              >
                chercher un domaine
              </a>
              .
            </li>
            <li>Colle-le ici et clique sur « Relier ».</li>
            <li>
              Dans Namecheap, onglet « Advanced DNS » : ajoute un enregistrement <code>A</code> (hôte{" "}
              <code>@</code>) vers <code>75.2.60.5</code> et un <code>CNAME</code> (hôte{" "}
              <code>www</code>) vers <code>{site.netlifyHost}</code>. Le https s&apos;active tout seul
              après quelques minutes.
            </li>
          </ol>
          <div className="flex gap-2">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="monsite.site"
              aria-label="Nom de domaine"
            />
            <Button onClick={attach} disabled={busy !== null || domain.trim() === ""}>
              {busy === "domain" && <Loader2 className="h-4 w-4 animate-spin" />}
              Relier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
