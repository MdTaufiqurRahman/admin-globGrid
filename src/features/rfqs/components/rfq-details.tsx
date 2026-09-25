import { ImageOff, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRfqDetail } from "../api";
import { formatDateTime, photosOf, sourceLabels, type Rfq } from "../model";

/**
 * What the table row has no room for: the long texts, the photos, and the
 * rest of the contact. The texts come with the list; the photos only with
 * the detail endpoint, which is read here.
 */
export function RfqDetails({ rfq }: { rfq: Rfq }) {
  const detail = useRfqDetail(rfq.id);
  // The detail is the fresher copy once it is in; until then the list row stands in.
  const shown = detail.data ?? rfq;
  const photos = photosOf(detail.data);

  return (
    <div className="grid gap-6 p-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-5">
        <TextBlock title="Description" text={shown.description} empty="No description given." />
        <TextBlock
          title="Specifications"
          text={shown.specifications}
          empty="No specifications given."
        />
        {shown.deliveryRequirements ? (
          <TextBlock title="Delivery requirements" text={shown.deliveryRequirements} />
        ) : null}

        <section className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-300">
            <Lock className="size-3" />
            Internal notes
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">
            {shown.internalNotes || (
              <span className="text-muted-foreground">
                No notes yet. Only admins see these.
              </span>
            )}
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <section>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Photos
          </h3>
          <div className="mt-2">
            {detail.isPending ? (
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
              </div>
            ) : detail.isError ? (
              <p className="text-sm text-muted-foreground">Couldn&apos;t load the photos.</p>
            ) : photos.length === 0 ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ImageOff className="size-4" />
                No photos sent.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.full}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${photo.name}`}
                    className="group block aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
          <Term label="Reference">
            <span className="font-mono">{shown.referenceNo ?? "—"}</span>
          </Term>
          <Term label="Company">
            <span title={shown.contactCompany}>{shown.contactCompany || "—"}</span>
          </Term>
          <Term label="Destination">
            <span title={shown.destinationCountry}>{shown.destinationCountry || "—"}</span>
          </Term>
          <Term label="Source">{shown.sourceType ? sourceLabels[shown.sourceType] : "—"}</Term>
          <Term label="Submitted">{formatDateTime(shown.createdAt)}</Term>
          <Term label="Updated">{formatDateTime(shown.updatedAt)}</Term>
        </dl>
      </div>
    </div>
  );
}

function TextBlock({ title, text, empty }: { title: string; text?: string; empty?: string }) {
  return (
    <section>
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">
        {text || <span className="text-muted-foreground">{empty}</span>}
      </p>
    </section>
  );
}

function Term({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </>
  );
}
