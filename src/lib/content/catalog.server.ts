/**
 * Server-only batch catalog. The upstream catalog feed is several megabytes,
 * so it is fetched, slimmed and cached here and never sent to the browser
 * in full.
 */

const CATALOG_URL = "https://studystark.github.io/batches/batches.json";
const CATALOG_TTL_MS = 30 * 60 * 1000;

export type CatalogBatch = {
  id: string;
  batchId: string;
  name: string;
  photo: string | null;
  exam: string | null;
  className: string | null;
  language: string | null;
  startDate: string | null;
  updatedAt: string | null;
};

type RawBatch = {
  id?: string;
  batch_id?: string;
  name?: string;
  photo?: string | null;
  exam?: string | null;
  class?: string | null;
  language?: string | null;
  start_date?: string | null;
  updated_at?: string | null;
};

let cache: CatalogBatch[] | null = null;
let cachedAt = 0;
let inflight: Promise<CatalogBatch[]> | null = null;

function parseExam(exam: string | null | undefined): string | null {
  if (!exam) return null;
  try {
    const parsed: unknown = JSON.parse(exam);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ") || null;
  } catch {
    /* plain string */
  }
  return exam;
}

async function loadCatalog(): Promise<CatalogBatch[]> {
  const res = await fetch(CATALOG_URL, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Catalog unavailable (${res.status})`);
  const json = (await res.json()) as { success?: boolean; data?: RawBatch[] };
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows
    .filter((r) => r?.batch_id && r?.name)
    .map((r) => ({
      id: String(r.id ?? r.batch_id),
      batchId: String(r.batch_id),
      name: String(r.name),
      photo: r.photo ?? null,
      exam: parseExam(r.exam),
      className: r.class ?? null,
      language: r.language ?? null,
      startDate: r.start_date ?? null,
      updatedAt: r.updated_at ?? null,
    }))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export async function getCatalog(): Promise<CatalogBatch[]> {
  if (cache && Date.now() - cachedAt < CATALOG_TTL_MS) return cache;
  if (!inflight) {
    inflight = loadCatalog()
      .then((rows) => {
        cache = rows;
        cachedAt = Date.now();
        inflight = null;
        return rows;
      })
      .catch((err) => {
        inflight = null;
        if (cache) return cache;
        throw err;
      });
  }
  return inflight;
}

export type CatalogPage = {
  items: CatalogBatch[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export async function queryCatalog(opts: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<CatalogPage> {
  const all = await getCatalog();
  const q = (opts.q ?? "").trim().toLowerCase();
  const pageSize = Math.min(Math.max(opts.pageSize ?? 24, 1), 60);
  const page = Math.max(opts.page ?? 1, 1);

  const filtered = q
    ? all.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.exam ?? "").toLowerCase().includes(q) ||
          (b.className ?? "").toLowerCase().includes(q),
      )
    : all;

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + pageSize < filtered.length,
  };
}