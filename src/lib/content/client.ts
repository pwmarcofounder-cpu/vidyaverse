/**
 * Browser-safe content client. Talks only to our own /api/content proxy —
 * never to the upstream host directly.
 */

export const SOURCE_ORIGIN = "https://vidcloud.eu.org";

export class ContentError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function contentGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  const res = await fetch(`/api/content/${path}${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON upstream response */
  }
  if (!res.ok) {
    const message =
      (json as { message?: string } | null)?.message ??
      (res.status === 404 ? "This content isn't available." : "Couldn't load this content.");
    throw new ContentError(message, res.status);
  }
  const payload = json as { success?: boolean; data?: T; message?: string } | null;
  if (!payload || payload.success === false) {
    throw new ContentError(payload?.message ?? "Content source returned an error.", 502);
  }
  return payload.data as T;
}

/* ---------------------------------------------------------------- types */

export type ImageRef = { baseUrl?: string; key?: string } | null;

export type BatchSubject = {
  _id: string;
  subject: string;
  subjectId?: string;
  slug: string;
  imageId?: ImageRef;
  lectureCount?: number;
  tagCount?: number;
};

export type BatchDetails = {
  _id: string;
  name: string;
  slug: string;
  byName?: string;
  language?: string;
  class?: string;
  previewImage?: ImageRef;
  startDate?: string;
  endDate?: string;
  shortDescription?: string;
  subjects?: BatchSubject[];
};

export type Topic = {
  _id: string;
  name: string;
  slug: string;
  videos?: number;
  lectureVideos?: number;
  notes?: number;
  exercises?: number;
};

export type ContentItem = {
  _id: string;
  topic?: string;
  url?: string;
  urlType?: string;
  videoDetails?: { image?: string; name?: string; duration?: string; videoUrl?: string };
  startTime?: string;
  date?: string;
  isFree?: boolean;
  lectureType?: string;
  tags?: { _id: string; name: string }[];
  homeworkIds?: {
    _id: string;
    topic?: string;
    attachmentIds?: { _id: string; name?: string; baseUrl?: string; key?: string }[];
  }[];
};

export function imageUrl(ref: ImageRef | undefined, fallback?: string | null): string | null {
  if (ref?.baseUrl && ref?.key) return `${ref.baseUrl}${ref.key}`;
  return fallback ?? null;
}

/* ------------------------------------------------------------ endpoints */

export const batchDetailsQuery = (batchId: string) => ({
  queryKey: ["batch-details", batchId],
  queryFn: () => contentGet<BatchDetails>(`v3/batches/${batchId}/details`),
  staleTime: 5 * 60 * 1000,
});

export const topicsQuery = (batchSlug: string, subjectSlug: string) => ({
  queryKey: ["topics", batchSlug, subjectSlug],
  queryFn: () => contentGet<Topic[]>(`v2/batches/${batchSlug}/subject/${subjectSlug}/topics`),
  staleTime: 5 * 60 * 1000,
});

export const contentsQuery = (
  batchSlug: string,
  subjectSlug: string,
  topicId: string,
  contentType: "videos" | "notes" | "DppNotes",
  page = 1,
) => ({
  queryKey: ["contents", batchSlug, subjectSlug, topicId, contentType, page],
  queryFn: () =>
    contentGet<ContentItem[]>(`v2/batches/${batchSlug}/subject/${subjectSlug}/contents`, {
      page,
      contentType,
      tag: topicId,
    }),
  staleTime: 2 * 60 * 1000,
});

/* ------------------------------------------------------------- playback */

/**
 * Rebuilds the source's own playback URL with the original parameters.
 * The media stream itself is never touched or re-encoded.
 */
export function buildPlayUrl(input: {
  batchId: string;
  subjectId: string;
  topicId: string;
  item: ContentItem;
  typeId?: string;
  playType?: "Lecture" | "solutions";
}) {
  const { batchId, subjectId, topicId, item } = input;
  const urlType = (item.urlType ?? "").toLowerCase();
  const isYoutube = urlType === "youtube";
  const params = new URLSearchParams();
  params.set("batch_id", batchId);
  params.set("subject_id", subjectId);
  params.set("topic_id", topicId);
  params.set("video_id", item._id);
  if (input.typeId) params.set("typeId", input.typeId);
  if (isYoutube && item.url) params.set("video_url", item.url);
  params.set("video_name", item.topic ?? item.videoDetails?.name ?? "");
  params.set("video_img", item.videoDetails?.image ?? "");
  params.set("video_type", isYoutube ? "youtube" : "new");
  params.set("play_type", input.playType ?? "Lecture");
  return `${SOURCE_ORIGIN}/play.php?${params.toString()}`;
}