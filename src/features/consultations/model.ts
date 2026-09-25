import type { components } from "@/lib/api/schema";

export type ConsultationRequest = components["schemas"]["ConsultationRequest"];
export type ConsultationStatus = NonNullable<ConsultationRequest["status"]>;

/** Rows on one page of the list. */
export const PAGE_SIZE = 10;

export const statuses: { value: ConsultationStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
];

/**
 * The business types the storefront's consultation form offers
 * (global-grid-frontend, `src/features/consultancy/schema.ts`). The API
 * stores the text as sent, so these must match it word for word.
 */
export const businessTypes = [
  "Manufacturer / Exporter",
  "Importer / Buyer",
  "Wholesaler / Distributor",
  "Retailer / E-commerce",
  "Trading House",
  "Logistics / Freight Forwarder",
  "Other",
] as const;
