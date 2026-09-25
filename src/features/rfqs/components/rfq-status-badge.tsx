import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { statusLabels, type RfqStatus } from "../model";

/** One colour per stage: blue while waiting, amber in review, violet and indigo while quoting. */
const tones: Record<RfqStatus, string> = {
  NEW: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  UNDER_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  QUOTATION_PREPARED:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  QUOTATION_SENT: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  COMPLETED: "border-border bg-muted text-muted-foreground",
};

export function RfqStatusBadge({ status }: { status: RfqStatus | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={cn("gap-1.5", tones[status])}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </Badge>
  );
}
