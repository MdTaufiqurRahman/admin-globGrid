import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { telHref } from "@/lib/links";
import type { ConsultationRequest } from "../model";

const COLUMNS = 6;

/**
 * One page of consultation requests. `offset` is how many rows the earlier
 * pages hold, so the serial numbers run on from page to page. `children`
 * stands in for the rows while there are none to show: loading, an error, or
 * no results.
 */
export function ConsultationsTable({
  requests,
  offset,
  children,
}: {
  requests: ConsultationRequest[];
  offset: number;
  children?: React.ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-14 pl-4">SL</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Business / Company Name</TableHead>
          <TableHead>Business Type</TableHead>
          <TableHead>Business Location</TableHead>
          <TableHead className="pr-4">Contact Number</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children ??
          requests.map((request, index) => (
            <ConsultationRow
              key={request.id ?? request.referenceNo ?? index}
              request={request}
              serial={offset + index + 1}
            />
          ))}
      </TableBody>
    </Table>
  );
}

function ConsultationRow({
  request,
  serial,
}: {
  request: ConsultationRequest;
  serial: number;
}) {
  return (
    <TableRow>
      <TableCell className="pl-4 text-muted-foreground tabular-nums">{serial}</TableCell>
      <TableCell className="font-medium">{request.name || "—"}</TableCell>
      <TableCell className="max-w-56 truncate" title={request.companyName}>
        {request.companyName || "—"}
      </TableCell>
      <TableCell>
        {request.businessType ? (
          <Badge variant="outline">{request.businessType}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      {/* Up to 500 characters, so it wraps onto two lines and the rest is in the tooltip. */}
      <TableCell className="max-w-64 whitespace-normal" title={request.location}>
        <span className="line-clamp-2">{request.location || "—"}</span>
      </TableCell>
      <TableCell className="pr-4">
        {request.contactNumber ? (
          <a
            href={telHref(request.contactNumber)}
            className="inline-flex items-center gap-1.5 tabular-nums hover:text-primary hover:underline"
          >
            <Phone className="size-3.5 text-muted-foreground" />
            {request.contactNumber}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

/** Placeholder rows while the first page loads, the table's shape already in place. */
export function ConsultationsTableSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell className="pl-4">
        <Skeleton className="h-4 w-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-36 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-44" />
      </TableCell>
      <TableCell className="pr-4">
        <Skeleton className="h-4 w-32" />
      </TableCell>
    </TableRow>
  ));
}

/** A single row spanning the table, for an error or an empty result. */
export function ConsultationsTableMessage({ children }: { children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMNS} className="p-0 whitespace-normal">
        {children}
      </TableCell>
    </TableRow>
  );
}
