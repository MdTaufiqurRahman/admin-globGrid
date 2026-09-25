import { ImageIcon, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { $api } from "@/lib/api/client";
import { problemOf } from "@/lib/api/problems";
import { thumbnailOf } from "../model";
import type { CategoryValues } from "../schema";

type Icon = CategoryValues["icon"];

/**
 * Picks the category's icon. A chosen file goes up to the media store at
 * once, and what the form keeps is the media id the API hands back.
 */
export function IconUpload({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: Icon;
  onChange: (icon: Icon) => void;
  invalid?: boolean;
}) {
  const upload = $api.useMutation("post", "/api/media/images");
  const input = useRef<HTMLInputElement>(null);

  async function send(file: File) {
    const form = new FormData();
    form.append("file", file);
    try {
      const media = await upload.mutateAsync({
        params: { query: { folder: "categories" } },
        // The schema types the binary part as a string, so the body only satisfies the
        // types; what goes out is the multipart form with the file itself.
        body: { file: file.name },
        bodySerializer: () => form,
      });
      if (!media.id) throw new Error("The upload came back without a media id");
      onChange({ id: media.id, url: thumbnailOf(media) });
      toast.success("Icon uploaded", {
        description: "It is saved with the category when the form is.",
      });
    } catch (error) {
      toast.error(`Couldn't upload ${file.name}`, { description: problemOf(error).message });
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground data-[invalid=true]:border-destructive"
        data-invalid={invalid}
      >
        {upload.isPending ? (
          <Spinner />
        ) : value?.url ? (
          <img src={value.url} alt="Category icon" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-5" />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex gap-2">
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            <Upload data-icon="inline-start" />
            {upload.isPending ? "Uploading…" : value ? "Replace" : "Upload"}
          </Button>
          {value && !upload.isPending ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">An image, square works best.</p>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so choosing the same file again still counts as a change.
          event.target.value = "";
          if (file) void send(file);
        }}
      />
    </div>
  );
}
