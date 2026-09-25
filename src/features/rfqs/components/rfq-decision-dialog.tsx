import { useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleX, ImageOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { $api } from "@/lib/api/client";
import { problemOf, statusOf } from "@/lib/api/problems";
import { cn } from "@/lib/utils";
import { refreshRfqs, useRfqDetail } from "../api";
import { formatQuantity, photosOf, REASON_MAX, type Rfq } from "../model";
import { RfqStatusBadge } from "./rfq-status-badge";

export type Decision = "accept" | "reject";

const copy = {
  accept: {
    title: "Accept this RFQ?",
    description:
      "It moves to Accepted. If the customer was signed in when they sent it, they see this on their account.",
    confirm: "Accept RFQ",
    pending: "Accepting…",
    done: "Accepted",
    icon: CircleCheck,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-600 text-white hover:bg-emerald-600/90",
  },
  reject: {
    title: "Reject this RFQ?",
    description: "It moves to Rejected, and can't be accepted afterwards.",
    confirm: "Reject RFQ",
    pending: "Rejecting…",
    done: "Rejected",
    icon: CircleX,
    tone: "bg-destructive/10 text-destructive",
    button: "bg-destructive text-white hover:bg-destructive/90",
  },
} satisfies Record<Decision, unknown>;

/** Asks before accepting or rejecting `rfq`, with a reason for the customer on a rejection. */
export function RfqDecisionDialog({
  open,
  onOpenChange,
  decision,
  rfq,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  rfq?: Rfq;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md"
        onOpenAutoFocus={(event) => {
          // Opens with nothing focused, the reason box included; Tab starts inside.
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        {rfq ? (
          <DecisionForm
            key={`${decision}-${rfq.id}`}
            decision={decision}
            rfq={rfq}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DecisionForm({
  decision,
  rfq,
  onDone,
}: {
  decision: Decision;
  rfq: Rfq;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const accept = $api.useMutation("post", "/api/rfqs/{id}/accept");
  const reject = $api.useMutation("post", "/api/rfqs/{id}/reject");
  const [reason, setReason] = useState("");
  const pending = accept.isPending || reject.isPending;
  const text = copy[decision];
  const Icon = text.icon;
  const label = rfq.referenceNo ?? rfq.productName ?? "the RFQ";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rfq.id) return;
    try {
      const params = { path: { id: rfq.id } };
      if (decision === "accept") await accept.mutateAsync({ params });
      else await reject.mutateAsync({ params, body: { reason: reason.trim() || undefined } });
      void refreshRfqs(queryClient);
      toast.success(`RFQ ${text.done.toLowerCase()}`, {
        description: `${label} is now ${text.done.toLowerCase()}.`,
      });
      onDone();
    } catch (error) {
      toast.error(`Couldn't ${decision} ${label}`, { description: problemOf(error).message });
      // A 409 means it has moved on since the list was loaded: the dialog closes and the
      // list refreshes to show where it is now. Anything else can be tried again.
      if (statusOf(error) === 409) {
        void refreshRfqs(queryClient);
        onDone();
      }
    }
  }

  return (
    <form onSubmit={submit} noValidate className="contents">
      <DialogHeader className="flex-row items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            text.tone,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col gap-1.5">
          <DialogTitle className="text-lg font-semibold">{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </div>
      </DialogHeader>

      <RfqSummary rfq={rfq} />

      {decision === "reject" ? (
        <Field>
          <FieldLabel htmlFor="rfq-reject-reason">
            Reason for the customer
            <span className="font-normal text-muted-foreground">Optional</span>
          </FieldLabel>
          <Textarea
            id="rfq-reject-reason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder="e.g. Unable to source this product currently"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="resize-none"
          />
          <div className="flex justify-between gap-3">
            <FieldDescription className="text-xs">
              Shown to the customer with the rejection.
            </FieldDescription>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {reason.length}/{REASON_MAX}
            </span>
          </div>
        </Field>
      ) : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending} className={text.button}>
          <Icon data-icon="inline-start" />
          {pending ? text.pending : text.confirm}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** The RFQ at a glance, so it is clear which one is being decided on. */
function RfqSummary({ rfq }: { rfq: Rfq }) {
  const photo = photosOf(useRfqDetail(rfq.id).data)[0];
  const contact = [rfq.contactName, rfq.contactCompany].filter(Boolean).join(" · ");

  return (
    <div className="min-w-0 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
          {photo ? (
            <img src={photo.thumbnail} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate font-medium" title={rfq.productName}>
              {rfq.productName || "Untitled request"}
            </p>
            <RfqStatusBadge status={rfq.status} />
          </div>
          {rfq.referenceNo ? (
            <p className="font-mono text-xs text-muted-foreground">{rfq.referenceNo}</p>
          ) : null}
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-sm">
        <SummaryItem label="Quantity">
          {formatQuantity(rfq.quantity)} {rfq.unit}
        </SummaryItem>
        <SummaryItem label="Destination">{rfq.destinationCountry || "—"}</SummaryItem>
        <SummaryItem label="Contact" wide>
          {contact || "—"}
        </SummaryItem>
      </dl>
    </div>
  );
}

function SummaryItem({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{children}</dd>
    </div>
  );
}
