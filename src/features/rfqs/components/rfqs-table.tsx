import { Check, ChevronDown, ImageOff, Phone, X } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { telHref } from "@/lib/links";
import { cn } from "@/lib/utils";
import { useRfqDetail } from "../api";
import { canDecide, formatQuantity, photosOf, type Rfq } from "../model";
import { RfqDetails } from "./rfq-details";
import { RfqStatusBadge } from "./rfq-status-badge";

const COLUMNS = 9;

/**
 * The Actions column stays in view while the table scrolls sideways. A sticky
 * cell needs a solid background, so each one matches what the row shows
 * through: the card, the row's hover, or an open row.
 */
const stickyEnd =
  "sticky right-0 z-10 bg-card group-hover/row:bg-[color-mix(in_oklab,var(--card),var(--muted)_50%)] group-data-[state=selected]/row:bg-muted";

/**
 * One page of RFQs. A click on a row, or on its arrow, opens its details: the
 * description, specifications and internal notes, with the photos. `offset` is how many
 * rows the earlier pages hold, so the serial numbers run on from page to
 * page. `children` stands in for the rows while there are none to show.
 */
export function RfqsTable({
  rfqs,
  offset,
  onAccept,
  onReject,
  children,
}: {
  rfqs: Rfq[];
  offset: number;
  onAccept: (rfq: Rfq) => void;
  onReject: (rfq: Rfq) => void;
  children?: React.ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-10 pl-4">SL</TableHead>
          <TableHead className="w-12"></TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Contact Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead
            className={cn(
              stickyEnd,
              "w-32 bg-[color-mix(in_oklab,var(--card),var(--muted)_50%)] pr-4 text-right",
            )}
          >
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children ??
          rfqs.map((rfq, index) => (
            <RfqRow
              key={rfq.id ?? rfq.referenceNo ?? index}
              rfq={rfq}
              serial={offset + index + 1}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
      </TableBody>
    </Table>
  );
}

function RfqRow({
  rfq,
  serial,
  onAccept,
  onReject,
}: {
  rfq: Rfq;
  serial: number;
  onAccept: (rfq: Rfq) => void;
  onReject: (rfq: Rfq) => void;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = `rfq-details-${rfq.id}`;
  const decidable = canDecide(rfq);
  const name = rfq.productName || "Untitled request";
  const closedReason = "Only new or under-review RFQs can be accepted or rejected";

  /**
   * A click anywhere on the row opens or closes its details, except on a link or
   * button in it — or on the wrapper a disabled button's tooltip hangs on — and
   * except when it ends a text selection, so an email or reference can be copied.
   * The arrow stays the way in for the keyboard.
   */
  function toggleFromRow(event: React.MouseEvent<HTMLTableRowElement>) {
    if ((event.target as Element).closest("a, button, [data-slot=tooltip-trigger]")) return;
    if (window.getSelection()?.isCollapsed === false) return;
    setOpen((value) => !value);
  }

  return (
    <Fragment>
      <TableRow
        data-state={open ? "selected" : undefined}
        className="group/row cursor-pointer [&>td]:py-2.5"
        onClick={toggleFromRow}
      >
        <TableCell className="pl-4 text-muted-foreground tabular-nums">{serial}</TableCell>
        <TableCell>
          <RfqThumb rfq={rfq} />
        </TableCell>
        <TableCell>
          <div className="max-w-56 truncate font-medium" title={name}>
            {name}
          </div>
          {rfq.referenceNo ? (
            <div className="font-mono text-xs text-muted-foreground">{rfq.referenceNo}</div>
          ) : null}
        </TableCell>
        <TableCell className="tabular-nums">
          <span className="font-medium">{formatQuantity(rfq.quantity)}</span>
          {rfq.unit ? <span className="text-muted-foreground"> {rfq.unit}</span> : null}
        </TableCell>
        <TableCell>{rfq.contactName || "—"}</TableCell>
        <TableCell>
          {rfq.contactEmail ? (
            <a
              href={`mailto:${rfq.contactEmail}`}
              title={rfq.contactEmail}
              className="block max-w-48 truncate hover:text-primary hover:underline"
            >
              {rfq.contactEmail}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          {rfq.contactPhone ? (
            <a
              href={telHref(rfq.contactPhone)}
              className="inline-flex items-center gap-1.5 tabular-nums hover:text-primary hover:underline"
            >
              <Phone className="size-3.5 text-muted-foreground" />
              {rfq.contactPhone}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>
          <RfqStatusBadge status={rfq.status} />
        </TableCell>
        <TableCell className={cn(stickyEnd, "pr-4")}>
          <div className="flex justify-end gap-1">
            <RowAction
              label="Accept"
              name={name}
              disabledReason={decidable ? undefined : closedReason}
              className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 dark:hover:text-emerald-400"
              onClick={() => onAccept(rfq)}
            >
              <Check />
            </RowAction>
            <RowAction
              label="Reject"
              name={name}
              disabledReason={decidable ? undefined : closedReason}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30"
              onClick={() => onReject(rfq)}
            >
              <X />
            </RowAction>
            <RowAction
              label={open ? "Hide details" : "Show details"}
              name={name}
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((value) => !value)}
            >
              <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
            </RowAction>
          </div>
        </TableCell>
      </TableRow>

      {open ? (
        <TableRow id={detailsId} className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={COLUMNS} className="p-0 whitespace-normal">
            {/* As wide as the visible table and pinned to its left edge, so the photos
                are in view however far the table is scrolled. */}
            <div className="sticky left-0 w-[100cqw]">
              <RfqDetails rfq={rfq} />
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </Fragment>
  );
}

function RowAction({
  label,
  name,
  disabledReason,
  className,
  onClick,
  children,
  ...aria
}: {
  label: string;
  name: string;
  disabledReason?: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}) {
  const button = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`${label}: ${name}`}
      disabled={Boolean(disabledReason)}
      className={className}
      onClick={onClick}
      {...aria}
    >
      {children}
    </Button>
  );

  return (
    <Tooltip>
      {/* A disabled button takes no pointer events, so its tooltip hangs on a wrapper. */}
      <TooltipTrigger asChild>
        {disabledReason ? <span className="inline-flex">{button}</span> : button}
      </TooltipTrigger>
      <TooltipContent>{disabledReason ?? label}</TooltipContent>
    </Tooltip>
  );
}

/** The first photo, read from the RFQ's detail since the list leaves attachments out. */
function RfqThumb({ rfq }: { rfq: Rfq }) {
  const detail = useRfqDetail(rfq.id);
  const photos = photosOf(detail.data);
  const [failed, setFailed] = useState<string | null>(null);
  const first = photos[0];

  if (detail.isPending) return <Skeleton className="size-10 rounded-lg" />;

  return (
    <div className="relative size-10">
      <div className="flex size-full items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
        {first && failed !== first.thumbnail ? (
          <img
            src={first.thumbnail}
            alt=""
            loading="lazy"
            className="size-full object-cover"
            onError={() => setFailed(first.thumbnail)}
          />
        ) : (
          <ImageOff className="size-4" aria-label="No photo" />
        )}
      </div>
      {photos.length > 1 ? (
        <span className="absolute -right-1.5 -bottom-1.5 rounded-full border bg-background px-1 text-[10px] leading-4 font-semibold tabular-nums">
          +{photos.length - 1}
        </span>
      ) : null}
    </div>
  );
}

/** Placeholder rows while the first page loads, the table's shape already in place. */
export function RfqsTableSkeleton({ rows }: { rows: number }) {
  const widths = ["w-5", "", "w-40", "w-16", "w-24", "w-32", "w-28", "w-20"];
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      {widths.map((width, column) => (
        <TableCell key={column} className={column === 0 ? "pl-4" : undefined}>
          {column === 1 ? (
            <Skeleton className="size-10 rounded-lg" />
          ) : (
            <Skeleton className={cn("h-4", width)} />
          )}
        </TableCell>
      ))}
      <TableCell className="pr-4">
        <div className="flex justify-end gap-1">
          <Skeleton className="size-7" />
          <Skeleton className="size-7" />
          <Skeleton className="size-7" />
        </div>
      </TableCell>
    </TableRow>
  ));
}

/** A single row spanning the table, for an error or an empty result. */
export function RfqsTableMessage({ children }: { children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMNS} className="p-0 whitespace-normal">
        {children}
      </TableCell>
    </TableRow>
  );
}
