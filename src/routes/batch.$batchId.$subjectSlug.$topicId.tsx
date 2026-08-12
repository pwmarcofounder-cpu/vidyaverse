import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, PlayCircle } from "lucide-react";
import { useState } from "react";

import { RowSkeleton, EmptyState, ErrorState } from "@/components/apex/states";
import {
  batchDetailsQuery,
  buildPlayUrl,
  contentsQuery,
  type ContentItem,
} from "@/lib/content/client";

type TopicSearch = { title?: string | undefined; subject?: string | undefined };
type Tab = "videos" | "notes" | "DppNotes";

const TABS: { key: Tab; label: string }[] = [
  { key: "videos", label: "Lectures" },
  { key: "notes", label: "Notes" },
  { key: "DppNotes", label: "DPP" },
];

export const Route = createFileRoute("/batch/$batchId/$subjectSlug/$topicId")({
  validateSearch: (search: Record<string, unknown>): TopicSearch => ({
    title: typeof search["title"] === "string" ? search["title"] : undefined,
    subject: typeof search["subject"] === "string" ? search["subject"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lectures — ApexLectures" },
      { name: "description", content: "Watch lectures and open notes for this topic." },
      { property: "og:title", content: "Lectures — ApexLectures" },
      { property: "og:description", content: "Watch lectures and open notes for this topic." },
    ],
  }),
  component: TopicPage,
});

function TopicPage() {
  const { batchId, subjectSlug, topicId } = Route.useParams();
  const { title, subject } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("videos");

  const details = useQuery(batchDetailsQuery(batchId));
  const batchSlug = details.data?.slug;

  const contents = useQuery({
    ...contentsQuery(batchSlug ?? "", subjectSlug, topicId, tab),
    enabled: Boolean(batchSlug),
  });

  const isLoading = details.isPending || contents.isPending;
  const error = details.error ?? contents.error;
  const items = contents.data ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        to="/batch/$batchId/$subjectSlug"
        params={{ batchId, subjectSlug }}
        search={{ title: subject }}
        className="text-xs font-semibold text-muted-foreground"
      >
        ← Back to topics
      </Link>
      <h1 className="mt-2 text-xl font-bold sm:text-2xl">{title ?? "Topic"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subject ?? details.data?.name ?? ""}</p>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? <RowSkeleton count={6} /> : null}
        {error ? (
          <ErrorState
            message={(error as Error).message || "Couldn't load this topic."}
            onRetry={() => contents.refetch()}
          />
        ) : null}
        {!isLoading && !error && items.length === 0 ? (
          <EmptyState message="Nothing published in this section yet." />
        ) : null}

        <div className="space-y-2">
          {items.map((item) =>
            tab === "videos" ? (
              <VideoRow
                key={item._id}
                item={item}
                batchId={batchId}
                subjectSlug={subjectSlug}
                topicId={topicId}
              />
            ) : (
              <NotesRow key={item._id} item={item} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function VideoRow({
  item,
  batchId,
  subjectSlug,
  topicId,
}: {
  item: ContentItem;
  batchId: string;
  subjectSlug: string;
  topicId: string;
}) {
  const href = buildPlayUrl({ batchId, subjectId: subjectSlug, topicId, item });
  const thumb = item.videoDetails?.image;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-accent"
    >
      <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
        <PlayCircle
          className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-background drop-shadow"
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-semibold">
          {item.topic ?? item.videoDetails?.name ?? "Lecture"}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {[item.videoDetails?.duration, item.date ? new Date(item.date).toLocaleDateString() : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
    </a>
  );
}

function NotesRow({ item }: { item: ContentItem }) {
  const attachments = (item.homeworkIds ?? []).flatMap((hw) => hw.attachmentIds ?? []);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-sm font-semibold">{item.topic ?? "Notes"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {attachments.length === 0 ? (
          <span className="text-xs text-muted-foreground">No attachment available.</span>
        ) : (
          attachments.map((a) => (
            <a
              key={a._id}
              href={`${a.baseUrl ?? ""}${a.key ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {a.name ?? "Open PDF"}
            </a>
          ))
        )}
      </div>
    </div>
  );
}