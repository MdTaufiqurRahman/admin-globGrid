import { keepPreviousData } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { CircleAlert, Headset } from "lucide-react";
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
  ConsultationsTable,
  ConsultationsTableMessage,
  ConsultationsTableSkeleton,
} from "@/features/consultations/components/consultations-table";
import { businessTypes, PAGE_SIZE, statuses } from "@/features/consultations/model";
import { $api } from "@/lib/api/client";
import { problemOf } from "@/lib/api/problems";
import { cn } from "@/lib/utils";

const consultationsSearch = z.object({
  /** Counts from 1, as the API does; left out on the first page. */
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().trim().optional().catch(undefined),
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]).optional().catch(undefined),
  businessType: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/consultations/")({
  staticData: { title: "Consultation Requests" },
  validateSearch: consultationsSearch,
  component: ConsultationsPage,
});

const businessTypeOptions = businessTypes.map((type) => ({ value: type, label: type }));

function ConsultationsPage() {
  const { page = 1, q = "", status, businessType } = Route.useSearch();
  const navigate = Route.useNavigate();
  const filtered = Boolean(q || status || businessType);

  const list = $api.useQuery(
    "get",
    "/api/consultation-requests",
    {
      params: {
        query: { page, size: PAGE_SIZE, q: q || undefined, status, businessType },
      },
    },
    // The page just left stays up, dimmed, until the next one arrives.
    { placeholderData: keepPreviousData },
  );
  const requests = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const pageCount = list.data?.totalPages ?? 0;

  /** A new search or filter starts again from the first page. */
  function filter(next: { q?: string; status?: typeof status; businessType?: string }) {
    void navigate({
      search: (prev) => ({ ...prev, ...next, page: undefined }),
      replace: true,
    });
  }

  function goToPage(next: number) {
    void navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
  }

  // Past the last page — an old link, or fewer requests than before — so step back to it.
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-heading text-xl font-bold">Consultation Requests</h1>
        <div className="grid gap-2 sm:grid-cols-[9rem_14rem_1fr] lg:w-auto">
          <FilterSelect
            label="Filter by status"
            allLabel="All statuses"
            options={statuses}
            value={status}
            onChange={(next) => filter({ status: next })}
          />
          <FilterSelect
            label="Filter by business type"
            allLabel="All business types"
            options={businessTypeOptions}
            value={businessType}
            onChange={(next) => filter({ businessType: next })}
          />
          <SearchField
            value={q}
            onSearch={(next) => filter({ q: next || undefined })}
            placeholder="Search name, company, phone…"
            label="Search consultation requests"
            className="lg:w-72"
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
          <ConsultationsTable requests={requests} offset={(page - 1) * PAGE_SIZE}>
            {list.isPending ? (
              <ConsultationsTableSkeleton rows={PAGE_SIZE} />
            ) : list.isError ? (
              <ConsultationsTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                      <CircleAlert />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load the consultation requests</EmptyTitle>
                    <EmptyDescription>{problemOf(list.error).message}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={() => void list.refetch()}>
                      Try again
                    </Button>
                  </EmptyContent>
                </Empty>
              </ConsultationsTableMessage>
            ) : requests.length === 0 ? (
              <ConsultationsTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Headset />
                    </EmptyMedia>
                    <EmptyTitle>
                      {filtered ? "No matching requests" : "No consultation requests yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {filtered
                        ? "Nothing matches these filters. Try another search or clear them."
                        : "Requests sent from the storefront's free-consultation form show up here."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {filtered ? (
                    <EmptyContent>
                      <Button
                        variant="outline"
                        onClick={() =>
                          filter({ q: undefined, status: undefined, businessType: undefined })
                        }
                      >
                        Clear filters
                      </Button>
                    </EmptyContent>
                  ) : null}
                </Empty>
              </ConsultationsTableMessage>
            ) : undefined}
          </ConsultationsTable>
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
    </div>
  );
}
