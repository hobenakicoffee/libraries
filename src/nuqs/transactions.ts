import {
  type inferParserType,
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs";
import {
  PaymentProviders,
  PaymentStatuses,
  PaymentTypes,
  ServiceTypes,
} from "../constants";
import { parseAsDateRange, parseAsSortOrder } from "./common";

export const transactionsFilterParsers = {
  statuses: parseAsArrayOf(
    parseAsStringLiteral(Object.values(PaymentStatuses))
  ),
  types: parseAsArrayOf(parseAsStringLiteral(Object.values(PaymentTypes))),
  serviceTypes: parseAsArrayOf(
    parseAsStringLiteral(Object.values(ServiceTypes))
  ),
  providers: parseAsArrayOf(
    parseAsStringLiteral(Object.values(PaymentProviders))
  ),
  dateRange: parseAsDateRange,
  amountSort: parseAsSortOrder,
};

export type TransactionFilters = inferParserType<
  typeof transactionsFilterParsers
>;
