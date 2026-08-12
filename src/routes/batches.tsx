import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { BatchCard } from "@/components/apex/BatchCard";
import { CardSkeleton, EmptyState, ErrorState } from "@/components/apex/states";
import { fetchCatalog } from "@/lib/content/catalog.functions";

type BatchSearch = { q?: string | undefined; page?: number | undefined };

export const Route = createFileRoute("/batches")({
  validateSearch: (search: Record<string, unknown>): BatchSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    page: Number(search["page"]) > 1 ? Number(search["page"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Batches — PW-MARCO" },
      {
        name: "description",
        content:
          "Search and browse every available PW-MARCO batch, with subjects, topics and lectures.",
      },
      { property: "og:title", content: "Browse Batches — PW-MARCO" },
      {
        property: "og:description",
        content: "Search thousands of study batches and jump straight into lectures.",
      },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const { q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/batches" });
  const [term, setTerm] = useState(q ?? "");
  const currentPage = page ?? 1;

  useEffect(() => setTerm(q ?? ""), [q]);

  const catalog = useServerFn(fetchCatalog);
  const query = useQuery({
    queryKey: ["catalog", q ?? "", currentPage],
    queryFn: () => catalog({ data: { q: q ?? "", page: currentPage, pageSize: 24 } }),
    staleTime: 5 * 60 * 1000,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/batches", search: { q: term.trim() || undefined, page: undefined } });
  }

  const data = query.data;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold">Browse batches</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {data ? `${data.total.toLocaleString()} batches available` : "Loading catalog…"}
      </p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search batch, exam or class"
            aria-label="Search batches"
            className="w-full rounded-xl border border-border bg-card py-3 pl-9 pr-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Search
        </button>
      </form>

      <div className="mt-5">
        {query.isPending ? <CardSkeleton count={6} /> : null}
        {query.isError ? (
          <ErrorState message="Couldn't load the batch catalog." onRetry={() => query.refetch()} />
        ) : null}
        {data && "error" in data && data.error ? <ErrorState message={data.error} /> : null}
        {data && data.items.length === 0 && !("error" in data && data.error) ? (
          <EmptyState message="No batches matched your search." />
        ) : null}
        {data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((b) => (
              <BatchCard key={b.batchId} batch={b} />
            ))}
          </div>
        ) : null}
      </div>

      {data && (currentPage > 1 || data.hasMore) ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={currentPage <= 1}
            onClick={() =>
              navigate({ to: "/batches", search: { q, page: currentPage - 1 || undefined } })
            }
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">Page {currentPage}</span>
          <button
            disabled={!data.hasMore}
            onClick={() => navigate({ to: "/batches", search: { q, page: currentPage + 1 } })}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}