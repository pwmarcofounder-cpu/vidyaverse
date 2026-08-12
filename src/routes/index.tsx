import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { BatchCard } from "@/components/apex/BatchCard";
import { CardSkeleton, ErrorState } from "@/components/apex/states";
import { LOGO_URL } from "@/components/apex/branding";
import { fetchCatalog } from "@/lib/content/catalog.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PW-MARCO — Free Lectures, Notes & Batches" },
      {
        name: "description",
        content:
          "PW-MARCO, powered by MARCO. Browse batches, subjects, topics and stream lectures on any device.",
      },
      { property: "og:title", content: "PW-MARCO — Free Lectures, Notes & Batches" },
      {
        property: "og:description",
        content: "Browse batches, subjects, topics and stream lectures on any device.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const catalog = useServerFn(fetchCatalog);
  const query = useQuery({
    queryKey: ["catalog", "", 1],
    queryFn: () => catalog({ data: { q: "", page: 1, pageSize: 12 } }),
    staleTime: 5 * 60 * 1000,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/batches", search: { q: term.trim() || undefined } });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <section className="rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
        <img
          src={LOGO_URL}
          alt="PW-MARCO"
          className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20"
          width={80}
          height={80}
        />
        <h1 className="mt-4 text-2xl font-bold sm:text-4xl">
          Every lecture. One clean place to study.
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          PW-MARCO brings batches, subjects, topics, lectures and notes together — fast on
          mobile, free to browse.
        </p>

        <form onSubmit={submit} className="mx-auto mt-6 flex max-w-lg gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search a batch, exam or class"
              aria-label="Search batches"
              className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            Go
          </button>
        </form>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          Recently updated
        </h2>
        <Link to="/batches" className="text-sm font-semibold text-muted-foreground">
          View all
        </Link>
      </div>

      <div className="mt-3">
        {query.isPending ? <CardSkeleton count={6} /> : null}
        {query.isError ? (
          <ErrorState message="Couldn't load batches." onRetry={() => query.refetch()} />
        ) : null}
        {query.data && "error" in query.data && query.data.error ? (
          <ErrorState message={query.data.error} />
        ) : null}
        {query.data && query.data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.items.map((b) => (
              <BatchCard key={b.batchId} batch={b} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
