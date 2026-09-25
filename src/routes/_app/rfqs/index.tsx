import { keepPreviousData } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { CircleAlert, FileText } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { FilterSelect } from "@/components/filter-select";
import { ListPagination } from "@/components/list-pagination";
import { SearchField } from "@/components/search-field";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  RfqDecisionDialog,
  type Decision,
} from "@/features/rfqs/components/rfq-decision-dialog";
import {
  RfqsTable,
  RfqsTableMessage,
  RfqsTableSkeleton,
} from "@/features/rfqs/components/rfqs-table";
import { PAGE_SIZE, statuses, type Rfq } from "@/features/rfqs/model";
import { $api } from "@/lib/api/client";
import { problemOf } from "@/lib/api/problems";
import { cn } from "@/lib/utils";

const rfqsSearch = z.object({
  /** Counts from 1, as the API does; left out on the first page. */
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().trim().optional().catch(undefined),
  status: z
    .enum([
      "NEW",
      "UNDER_REVIEW",
      "QUOTATION_PREPARED",
      "QUOTATION_SENT",
      "ACCEPTED",
      "REJECTED",
      "COMPLETED",
    ])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/_app/rfqs/")({
  staticData: { title: "RFQs" },
  validateSearch: rfqsSearch,
  component: RfqsPage,
});

/** The dialog's state. The RFQ outlives `open`, so it closes without flashing another. */
type DecisionState = { open: boolean; decision: Decision; rfq?: Rfq };

function RfqsPage() {
  const { page = 1, q = "", status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [deciding, setDeciding] = useState<DecisionState>({ open: false, decision: "accept" });
  const filtered = Boolean(q || status);

  const list = $api.useQuery(
    "get",
    "/api/rfqs",
    { params: { query: { page, size: PAGE_SIZE, q: q || undefined, status } } },
    // The page just left stays up, dimmed, until the next one arrives.
    { placeholderData: keepPreviousData },
  );
  const rfqs = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const pageCount = list.data?.totalPages ?? 0;

  /** A new search or filter starts again from the first page. */
  function filter(next: { q?: string; status?: typeof status }) {
    void navigate({
      search: (prev) => ({ ...prev, ...next, page: undefined }),
      replace: true,
    });
  }

  function goToPage(next: number) {
    void navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
  }

  // Past the last page — an old link, or fewer RFQs than before — so step back to it.
  if (list.data && !list.isPlaceholderData && page > Math.max(pageCount, 1)) {
    const last = Math.max(pageCount, 1);
    return (
      <Navigate
        to="."
        search={(prev) => ({ ...prev, page: last > 1 ? last : undefined })}
        replace
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl font-bold">RFQs</h1>
        <div className="grid gap-2 sm:grid-cols-[12rem_1fr] md:w-auto">
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            options={statuses}
            value={status}
            onChange={(next) => filter({ status: next })}
          />
          <SearchField
            value={q}
            onSearch={(next) => filter({ q: next || undefined })}
            placeholder="Search reference, product, contact…"
            label="Search RFQs"
            className="md:w-72"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div
          className={cn(
            "transition-opacity",
            list.isPlaceholderData && "pointer-events-none opacity-60",
          )}
          aria-busy={list.isFetching}
        >
          <RfqsTable
            rfqs={rfqs}
            offset={(page - 1) * PAGE_SIZE}
            onAccept={(rfq) => setDeciding({ open: true, decision: "accept", rfq })}
            onReject={(rfq) => setDeciding({ open: true, decision: "reject", rfq })}
          >
            {list.isPending ? (
              <RfqsTableSkeleton rows={PAGE_SIZE} />
            ) : list.isError ? (
              <RfqsTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                      <CircleAlert />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load the RFQs</EmptyTitle>
                    <EmptyDescription>{problemOf(list.error).message}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={() => void list.refetch()}>
                      Try again
                    </Button>
                  </EmptyContent>
                </Empty>
              </RfqsTableMessage>
            ) : rfqs.length === 0 ? (
              <RfqsTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText />
                    </EmptyMedia>
                    <EmptyTitle>{filtered ? "No matching RFQs" : "No RFQs yet"}</EmptyTitle>
                    <EmptyDescription>
                      {filtered
                        ? "Nothing matches these filters. Try another search or clear them."
                        : "Requests for quotation sent from the storefront show up here."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {filtered ? (
                    <EmptyContent>
                      <Button
                        variant="outline"
                        onClick={() => filter({ q: undefined, status: undefined })}
                      >
                        Clear filters
                      </Button>
                    </EmptyContent>
                  ) : null}
                </Empty>
              </RfqsTableMessage>
            ) : undefined}
          </RfqsTable>
        </div>

        {list.data ? (
          <div className="border-t">
            <ListPagination
              page={page}
              pageCount={pageCount}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={goToPage}
            />
          </div>
        ) : null}
      </div>

      <RfqDecisionDialog
        open={deciding.open}
        decision={deciding.decision}
        rfq={deciding.rfq}
        onOpenChange={(open) => setDeciding((state) => ({ ...state, open }))}
      />
    </div>
  );
}
