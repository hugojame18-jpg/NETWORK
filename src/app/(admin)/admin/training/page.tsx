import type { Metadata } from "next";
import { getTrainingVideosAdminList } from "@/lib/data/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingComposer } from "@/components/dashboard/admin/training-composer";
import { TrainingActions } from "@/components/dashboard/admin/training-actions";
import { videoThumbnail, videoHost } from "@/lib/video";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata: Metadata = { title: "Formation" };

export default async function AdminTrainingPage() {
  const videos = await getTrainingVideosAdminList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formation"
        description="Les vidéos mises à disposition de tes affiliés, dans l'ordre où elles leur sont présentées."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ajouter une vidéo</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainingComposer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vidéos publiées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videos.map((video, index) => {
              const thumbnail = videoThumbnail(video.url);
              return (
                <div
                  key={video.id}
                  className={`flex gap-3 rounded-lg border p-3 ${
                    video.active
                      ? "border-border"
                      : "border-border/60 bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnail}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      "Vidéo"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                      <p className="font-medium">{video.title}</p>
                      <Badge variant={video.active ? "default" : "secondary"}>
                        {video.active ? "Visible" : "Masquée"}
                      </Badge>
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-xs text-primary hover:underline"
                    >
                      {videoHost(video.url)}
                    </a>
                    {video.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <TrainingActions id={video.id} active={video.active} />
                </div>
              );
            })}

            {videos.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Aucune vidéo pour le moment. Ajoutes-en une à gauche.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
