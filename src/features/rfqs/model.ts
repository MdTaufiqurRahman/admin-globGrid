import type { components } from "@/lib/api/schema";

export type Rfq = components["schemas"]["Rfq"];
export type RfqStatus = NonNullable<Rfq["status"]>;

/** Rows on one page of the list. */
export const PAGE_SIZE = 10;

/** The API's limit on a rejection reason. */
export const REASON_MAX = 1000;

/** The storefront's words for each status (global-grid-frontend, `features/account`), so both read alike. */
export const statusLabels: Record<RfqStatus, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under Review",
  QUOTATION_PREPARED: "Quotation Prepared",
  QUOTATION_SENT: "Quotation Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export const statuses = (Object.keys(statusLabels) as RfqStatus[]).map((value) => ({
  value,
  label: statusLabels[value],
}));

export const sourceLabels: Record<NonNullable<Rfq["sourceType"]>, string> = {
  GENERAL: "General request",
  PRODUCT: "From a product page",
  FACTORY: "From a factory page",
};

/** The API accepts or rejects an RFQ only while it is new or under review; later on it answers 409. */
export function canDecide(rfq: Rfq) {
  return rfq.status === "NEW" || rfq.status === "UNDER_REVIEW";
}

export type Photo = { id: string; thumbnail: string; full: string; name: string };

/**
 * The RFQ's photos, each as a small picture and a large one. Only the detail
 * endpoint loads attachments; the list leaves them out.
 */
export function photosOf(rfq: Rfq | undefined): Photo[] {
  return (rfq?.attachments ?? []).flatMap((attachment, index) => {
    const urls = attachment.media?.urls ?? {};
    const thumbnail = attachment.thumbnailUrl ?? urls.thumbnail ?? Object.values(urls)[0];
    if (!thumbnail) return [];
    return [
      {
        id: attachment.id ?? attachment.mediaId ?? String(index),
        thumbnail,
        full: urls.detail ?? urls.listing ?? thumbnail,
        name: attachment.originalName ?? `Photo ${index + 1}`,
      },
    ];
  });
}

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function formatDateTime(value: string | undefined) {
  return value ? dateTime.format(new Date(value)) : "—";
}

export function formatQuantity(quantity: number | undefined) {
  return quantity === undefined ? "—" : quantity.toLocaleString("en-US");
}
