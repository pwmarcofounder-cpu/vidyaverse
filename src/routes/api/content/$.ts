import { createFileRoute } from "@tanstack/react-router";

/**
 * Generic pass-through to the authorized content source.
 *
 * /api/content/<anything>?<any query>  ->  <source>/api/<anything>?<any query>
 *
 * New upstream routes work with no changes here.
 */
export const Route = createFileRoute("/api/content/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { upstreamApi } = await import("@/lib/content/upstream.server");
        const splat = (params as { _splat?: string })._splat ?? "";
        if (!splat) {
          return Response.json(
            { success: false, message: "Missing content path" },
            { status: 400 },
          );
        }
        const search = new URL(request.url).search;
        const result = await upstreamApi(splat, search);
        return new Response(result.body, {
          status: result.status,
          headers: {
            "content-type": result.contentType,
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});