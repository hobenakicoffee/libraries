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

export const parseAsLastTimeRange = parseAsStringLiteral([
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_180_days",
  "last_year",
]);
export type LastTimeRange = inferParserType<typeof parseAsLastTimeRange>;
