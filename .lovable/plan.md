# ApexLectures — Powered by MARCO

A new mobile-first frontend for the authorized content source at `vidcloud.eu.org`, with a modular server-side integration layer.

## What I verified about the source

- `GET /generate_token.php` returns `{ success, access_token }` — a short-lived bearer token, no login required.
- `GET /api/**` is a transparent pass-through to the upstream content API. Confirmed working: `/api/v3/batches/{batchId}/details` returns real batch metadata with that bearer.
- The batch catalog is a static JSON feed (`studystark.github.io/batches/batches.json`, ~14,500 batches) with `batch_id`, `name`, `photo`, `exam`, `class`, `language`, `amount`, dates.
- Existing routes are query-param driven: `page=batches | batch_details | lessons | content | Mahapack | Khazana`, with params `batch_id`, `subject_id`, `topic_id`, `title`, `subjectTitle`, `mahapackId`, `isWeeklySchedule`.
- Video playback is a navigation to `play.php?...` carrying `embed`, `video_name`, `video_image`, `video_type`, `play_type` — no media processing.

## Integration layer (server-side only)

A single generic proxy, not per-endpoint hardcoding:

- `src/routes/api/content/$.ts` — splat route. Any path `/api/content/<anything>?<any query>` is forwarded verbatim to `https://vidcloud.eu.org/api/<anything>?<same query>`.
- Token manager module: fetches `generate_token.php` server-side, caches it in memory, refreshes on 401 and retries once. The token and upstream host never reach the browser.
- Catalog module: fetches and caches the batch catalog server-side, exposing paged listing + search server functions so the client never downloads the 8 MB file.
- Unsupported or unavailable upstream routes pass their status through and render a friendly "content unavailable" state.
- New upstream endpoints work with no code change — the splat forwards whatever path the UI asks for.

## Frontend routes

All content and metadata come from the source; nothing is hardcoded or faked.

- `/` — home: branding, search bar, featured/recent batches from the catalog.
- `/batches` — paged, searchable batch listing (`q`, `page` preserved in the URL).
- `/batch/$batchId` — batch details + subject grid. Accepts `mahapackId`, `isWeeklySchedule`.
- `/batch/$batchId/$subjectId` — topics / lessons listing (`subjectTitle` preserved).
- `/batch/$batchId/$subjectId/$topicId` — lesson & video listing (`title`, `subjectTitle` preserved).
- `/search` — global batch search.
- Legacy compatibility: `/?page=batch_details&batch_id=...` style links redirect to the matching new route so existing IDs and links keep working.

Every route gets skeleton loading states, empty states, and an error state with retry, plus its own `head()` metadata.

## Video handling

Clicking a lecture builds the exact same `play.php?` URL with the original `embed`, `video_name`, `video_image`, `video_type`, `play_type` values returned by the API and opens it on the source site in a new tab. No player is built, no stream is touched or re-encoded.

## Branding & UI

- Logo from the supplied URL, wordmark "ApexLectures" with "Powered by MARCO" beneath — header, popup, and favicon.
- Mobile-first: sticky compact header, card grids collapsing to one column, Android-friendly tap targets, lazy-loaded thumbnails.
- Distinct design system in `src/styles.css` — deep indigo/near-black surfaces with an amber accent and a geometric display face for headings. Light and dark both supported.

## Telegram popup

Lightweight component shown once per session (`sessionStorage` flag set on dismiss): ApexLectures logo, short invite line, JOIN NOW button opening `https://t.me/official_marco_22` in a new tab, and a close button. Full-width sheet on mobile, centered card on desktop.

## Technical notes

- The proxy is a TanStack server route; upstream base URL and token logic live only in server modules and never enter the client bundle.
- Client data fetching uses TanStack Query with route loaders prefetching for instant, cached navigation.
- Frontend components never call the upstream directly — only `/api/content/*` and the catalog server functions.
- No database or auth is needed, so Lovable Cloud stays off.