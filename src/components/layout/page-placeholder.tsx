import { Hammer } from "lucide-react";

/**
 * A page that is in the menu but not built yet. Keeps the navigation honest
 * instead of shipping dead links.
 */
export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mt-6 max-w-xl rounded-xl border bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Hammer className="size-5" />
      </div>
      <h1 className="mt-4 font-heading text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
