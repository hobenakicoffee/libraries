import { type inferParserType, parseAsJson, parseAsStringLiteral } from "nuqs";
import { z } from "zod";

export const parseAsSortOrder = parseAsStringLiteral(["asc", "desc"]);
export type SortOrder = inferParserType<typeof parseAsSortOrder>;

export const parseAsDateRange = parseAsJson(
  z.object({
    from: z.date(),
    to: z.date().optional(),
  })
);
