import type { Metadata } from "next";
import { PlayCircle, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/rbac";
import { getTrainingVideos } from "@/lib/data/publisher";
import { Card, CardContent } from "@/components/ui/card";
import { videoThumbnail, videoHost } from "@/lib/video";

export const metadata: Metadata = { title: "Formation" };

export default async function TrainingPage() {
  await requireRole("PUBLISHER");
  const videos = await getTrainingVideos();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Formation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Les vidéos du réseau pour apprendre à générer du trafic et convertir. Regarde-les dans l&apos;ordre.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video, index) => {
          const thumbnail = videoThumbnail(video.url);
          return (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="group hover-lift shadow-premium flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
                {thumbnail ? (
                  // Remote thumbnail: a plain <img> avoids configuring a loader
                  // for every video host an admin might paste.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <PlayCircle className="h-12 w-12 text-white" />
                </span>
                <span className="absolute top-2 left-2 rounded-md bg-background/90 px-2 py-0.5 text-[11px] font-medium">
                  {index + 1}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <p className="font-semibold group-hover:underline">{video.title}</p>
                {video.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{video.description}</p>
                )}
                <p className="mt-auto pt-2 text-xs text-muted-foreground">{videoHost(video.url)}</p>
              </div>
            </a>
          );
        })}
      </div>

      {videos.length === 0 && (
        <Card className="shadow-premium">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Les premières vidéos de formation arrivent très bientôt.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
