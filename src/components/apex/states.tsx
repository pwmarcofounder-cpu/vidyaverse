import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox } from "lucide-react";

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-card p-4"
          aria-hidden
        >
          <div className="h-28 w-full rounded-xl bg-muted" />
          <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl border border-border bg-card"
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-destructive" aria-hidden />
      <p className="mt-3 text-sm font-medium text-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <button
            onClick={onRetry}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
        ) : null}
        <Link
          to="/batches"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
        >
          Browse batches
        </Link>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Inbox className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
