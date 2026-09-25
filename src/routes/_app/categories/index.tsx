import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { CircleAlert, Plus, Tags } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
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
  CategoriesTable,
  CategoriesTableMessage,
  CategoriesTableSkeleton,
} from "@/features/categories/components/categories-table";
import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog";
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog";
import { allCategoriesQuery } from "@/features/categories/api";
import { PAGE_SIZE, pathsOf, type Category } from "@/features/categories/model";
import { $api } from "@/lib/api/client";
import { problemOf } from "@/lib/api/problems";
import { cn } from "@/lib/utils";

const categoriesSearch = z.object({
  /** Counts from 1, as the API does; left out on the first page. */
  page: z.number().int().min(1).optional().catch(undefined),
  q: z.string().trim().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/categories/")({
  staticData: { title: "Categories" },
  validateSearch: categoriesSearch,
  component: CategoriesPage,
});

/** A dialog's state. What it is open on outlives `open`, so it closes without flashing another. */
type FormState = { open: boolean; categoryId?: string };
type DeleteState = { open: boolean; category?: Category };

function CategoriesPage() {
  const { page = 1, q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [form, setForm] = useState<FormState>({ open: false });
  const [deleting, setDeleting] = useState<DeleteState>({ open: false });

  const list = $api.useQuery(
    "get",
    "/api/categories",
    { params: { query: { page, size: PAGE_SIZE, q: q || undefined } } },
    // The page just left stays up, dimmed, until the next one arrives.
    { placeholderData: keepPreviousData },
  );
  // The list gives each row only its parent's id; the whole catalogue names them.
  const all = useQuery(allCategoriesQuery);
  const parentPaths = all.data
    ? pathsOf(all.data)
    : all.isError
      ? new Map<string, string>()
      : undefined;
  const categories = list.data?.content ?? [];
  const total = list.data?.totalElements ?? 0;
  const pageCount = list.data?.totalPages ?? 0;

  function search(next: string) {
    void navigate({
      search: (prev) => ({ ...prev, q: next || undefined, page: undefined }),
      replace: true,
    });
  }

  function goToPage(next: number) {
    void navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
  }

  // Past the last page — the last row on it deleted, or an old link — so step back to it.
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
        <h1 className="font-heading text-xl font-bold">Categories</h1>
        <div className="flex items-center gap-2">
          <SearchField
            value={q}
            onSearch={search}
            placeholder="Search categories…"
            label="Search categories"
            className="sm:w-72"
          />
          <Button onClick={() => setForm({ open: true })}>
            <Plus data-icon="inline-start" />
            New category
          </Button>
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
          <CategoriesTable
            categories={categories}
            offset={(page - 1) * PAGE_SIZE}
            parentPaths={parentPaths}
            onEdit={(category) => setForm({ open: true, categoryId: category.id })}
            onDelete={(category) => setDeleting({ open: true, category })}
          >
            {list.isPending ? (
              <CategoriesTableSkeleton rows={PAGE_SIZE} />
            ) : list.isError ? (
              <CategoriesTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                      <CircleAlert />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load the categories</EmptyTitle>
                    <EmptyDescription>{problemOf(list.error).message}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={() => void list.refetch()}>
                      Try again
                    </Button>
                  </EmptyContent>
                </Empty>
              </CategoriesTableMessage>
            ) : categories.length === 0 ? (
              <CategoriesTableMessage>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Tags />
                    </EmptyMedia>
                    <EmptyTitle>
                      {q ? "No matching categories" : "No categories yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {q
                        ? `Nothing matches “${q}”. Try another name or slug.`
                        : "Add the first one to start building the catalog."}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {q ? (
                      <Button variant="outline" onClick={() => search("")}>
                        Clear search
                      </Button>
                    ) : (
                      <Button onClick={() => setForm({ open: true })}>
                        <Plus data-icon="inline-start" />
                        New category
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </CategoriesTableMessage>
            ) : undefined}
          </CategoriesTable>
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

      <CategoryFormDialog
        open={form.open}
        categoryId={form.categoryId}
        onOpenChange={(open) => setForm((state) => ({ ...state, open }))}
      />
      <DeleteCategoryDialog
        open={deleting.open}
        category={deleting.category}
        onOpenChange={(open) => setDeleting((state) => ({ ...state, open }))}
      />
    </div>
  );
}
