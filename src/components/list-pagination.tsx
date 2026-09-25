import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The bar under a paged list: which rows are showing, and the pages to move
 * between. Pages count from 1, as the API counts them.
 */
export function ListPagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const count = Math.max(pageCount, 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{first}</span>–
            <span className="font-medium text-foreground">{last}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>

        <span className="px-2 text-sm text-muted-foreground sm:hidden">
          Page {page} of {count}
        </span>
        <div className="hidden items-center gap-1 sm:flex">
          {pagesAround(page, count).map((entry, index) =>
            entry === null ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="flex size-7 items-center justify-center text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={entry}
                variant={entry === page ? "default" : "ghost"}
                size="icon-sm"
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= count}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}

/**
 * The page numbers to offer, `null` standing for a run left out: always the
 * first and the last, and the pages either side of the current one — seven
 * slots at most, so the bar keeps its width.
 */
function pagesAround(page: number, count: number): (number | null)[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, null, count];
  if (page >= count - 3) return [1, null, count - 4, count - 3, count - 2, count - 1, count];
  return [1, null, page - 1, page, page + 1, null, count];
}
