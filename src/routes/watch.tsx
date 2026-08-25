import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { buildPlayerEmbedUrl, streamUrlQuery } from "@/lib/content/client";

type WatchSearch = {
  batchId: string;
  subjectId: string;
  scheduleId: string;
  title?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

export const Route = createFileRoute("/watch")({
  validateSearch: (search: Record<string, unknown>): WatchSearch => ({
    batchId: str(search["batchId"]),
    subjectId: str(search["subjectId"]),
    scheduleId: str(search["scheduleId"]),
    title: typeof search["title"] === "string" ? search["title"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Watch Lecture — PW-MARCO" },
      { name: "description", content: "Stream your PW-MARCO lecture in full screen." },
      { property: "og:title", content: "Watch Lecture — PW-MARCO" },
      { property: "og:description", content: "Stream your PW-MARCO lecture in full screen." },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const { batchId, subjectId, scheduleId, title } = Route.useSearch();
  const router = useRouter();

  const stream = useQuery({
    ...streamUrlQuery({ batchId, subjectId, scheduleId }),
    enabled: Boolean(batchId && subjectId && scheduleId),
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button
          onClick={() => router.history.back()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">{title ?? "Lecture"}</span>
      </div>

      <div className="relative flex-1">
        {stream.isPending ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading stream…
          </div>
        ) : stream.isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {(stream.error as Error).message || "Couldn't load this lecture."}
            </p>
            <button
              onClick={() => stream.refetch()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          </div>
        ) : (
          <iframe
            src={buildPlayerEmbedUrl(stream.data as string)}
            title={title ?? "Lecture player"}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
