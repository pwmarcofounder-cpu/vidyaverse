import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Clock, PlayCircle } from "lucide-react";

import { CardSkeleton, EmptyState, ErrorState } from "@/components/apex/states";
import {
  batchDetailsQuery,
  buildPlayUrl,
  imageUrl,
  todaysScheduleQuery,
  type ScheduleItem,
} from "@/lib/content/client";

function TodaysClasses({ batchId, fallbackSubjectId }: { batchId: string; fallbackSubjectId: string }) {
  const schedule = useQuery(todaysScheduleQuery(batchId));
  const items: ScheduleItem[] = schedule.data ?? [];

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold">Today&apos;s classes</h2>
      {schedule.isPending ? (
        <div className="mt-3 h-16 animate-pulse rounded-2xl bg-muted" />
      ) : items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No class scheduled for today.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const subjectId = item.batchSubjectId ?? item.subjectId ?? fallbackSubjectId;
            const href = buildPlayUrl({ batchId, subjectId, childId: item._id });
            const when = item.startTime
              ? item.startTime
              : item.date
                ? new Date(item.date).toLocaleString()
                : "";
            return (
              <a
                key={item._id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
              >
                <PlayCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {item.topic ?? item.videoDetails?.name ?? "Live class"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {[when, item.lectureType].filter(Boolean).join(" · ") || "Tap to open"}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}


export const Route = createFileRoute("/batch/$batchId/")({
  head: () => ({
    meta: [
      { title: "Batch — PW-MARCO" },
      {
        name: "description",
        content: "Subjects, topics and lectures for this PW-MARCO batch.",
      },
      { property: "og:title", content: "Batch — PW-MARCO" },
      {
        property: "og:description",
        content: "Open subjects, topics and lectures for this batch.",
      },
    ],
  }),
  component: BatchPage,
});

function plainText(html?: string) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function BatchPage() {
  const { batchId } = Route.useParams();
  const query = useQuery(batchDetailsQuery(batchId));
  const batch = query.data;
  const cover = imageUrl(batch?.previewImage);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {query.isPending ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <CardSkeleton count={4} />
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          message={(query.error as Error).message || "This batch isn't available."}
          onRetry={() => query.refetch()}
        />
      ) : null}

      {batch ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {cover ? (
              <img src={cover} alt={batch.name} className="h-40 w-full object-cover sm:h-56" />
            ) : null}
            <div className="p-4">
              <h1 className="text-xl font-bold leading-snug sm:text-2xl">{batch.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {batch.class ? <span>Class {batch.class}</span> : null}
                {batch.language ? <span>· {batch.language}</span> : null}
                {batch.startDate ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {new Date(batch.startDate).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
              {plainText(batch.shortDescription) ? (
                <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">
                  {plainText(batch.shortDescription)}
                </p>
              ) : null}
            </div>
          </div>

          <h2 className="mt-6 text-lg font-bold">Subjects</h2>
          {batch.subjects && batch.subjects.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {batch.subjects.map((s) => (
                <Link
                  key={s._id}
                  to="/batch/$batchId/$subjectSlug"
                  params={{ batchId, subjectSlug: s.slug }}
                  search={{ title: s.subject }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
                    {imageUrl(s.imageId) ? (
                      <img
                        src={imageUrl(s.imageId) as string}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <BookOpen className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{s.subject}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.lectureCount ? `${s.lectureCount} lectures` : "View topics"}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No subjects published for this batch yet." />
          )}
        </>
      ) : null}
    </div>
  );
}