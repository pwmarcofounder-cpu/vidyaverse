import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const catalogInput = z.object({
  q: z.string().max(120).optional(),
  page: z.number().int().min(1).max(2000).optional(),
  pageSize: z.number().int().min(1).max(60).optional(),
});

export const fetchCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => catalogInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { queryCatalog } = await import("./catalog.server");
    try {
      return await queryCatalog({
        q: data.q ?? "",
        page: data.page ?? 1,
        pageSize: data.pageSize ?? 24,
      });
    } catch {
      return {
        items: [],
        total: 0,
        page: data.page ?? 1,
        pageSize: data.pageSize ?? 24,
        hasMore: false,
        error: "Catalog is temporarily unavailable.",
      };
    }
  });