import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { $api } from "@/lib/api/client";
import { problemOf, statusOf } from "@/lib/api/problems";
import { allCategoriesQuery, refreshCategories } from "../api";
import { nameOf, parentChoices, type Category } from "../model";
import {
  categorySchema,
  emptyCategory,
  slugify,
  toRequest,
  valuesOf,
  type CategoryValues,
} from "../schema";
import { IconUpload } from "./icon-upload";

/** Radix's Select has no empty value, so "no parent" goes by this one. */
const TOP_LEVEL = "top-level";

/** The API's names for the fields, mapped to the form's. */
const fieldNames: Record<string, keyof CategoryValues> = {
  name: "nameEn",
  "name.en": "nameEn",
  "name.bn": "nameBn",
  slug: "slug",
  parentId: "parentId",
  sortOrder: "sortOrder",
  visibility: "visibility",
  iconMediaId: "icon",
};

/**
 * Adds a category, or edits the one `categoryId` names. An edit opens on the
 * category as `GET /api/categories/{id}` has it now, not as the list row
 * showed it, and saves it back with `PUT /api/categories/{id}`.
 */
export function CategoryFormDialog({
  open,
  onOpenChange,
  categoryId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
}) {
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl"
        onOpenAutoFocus={(event) => {
          // Opens with no field focused: focus goes to the dialog itself, so screen readers
          // are inside it and Tab starts at the first field.
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {categoryId ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Public categories show on the storefront; hidden ones stay here.
          </DialogDescription>
        </DialogHeader>
        {/* Keyed so opening it on another category starts from that category's values. */}
        {categoryId ? (
          <EditCategory key={categoryId} id={categoryId} onDone={close} />
        ) : (
          <CategoryForm key="new" onDone={close} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Fetches the category, then hands it to the form. */
function EditCategory({ id, onDone }: { id: string; onDone: () => void }) {
  const detail = $api.useQuery(
    "get",
    "/api/categories/{id}",
    { params: { path: { id } } },
    {
      // Dropped once the dialog closes, so every edit starts from a fresh copy; and not
      // fetched again while it is open, which would only be ignored by a form in use.
      gcTime: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  if (detail.data) return <CategoryForm category={detail.data} onDone={onDone} />;

  if (detail.isError) {
    return (
      <>
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{problemOf(detail.error).message}</AlertDescription>
        </Alert>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={() => void detail.refetch()}>
            Try again
          </Button>
        </DialogFooter>
      </>
    );
  }

  return <FormSkeleton />;
}

/** The form's shape while the category loads, so the dialog does not jump when it arrives. */
function FormSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-5" aria-busy aria-label="Loading the category">
        <div className="grid gap-5 sm:grid-cols-2">
          <SkeletonField />
          <SkeletonField />
        </div>
        <SkeletonField hint />
        <div className="grid gap-5 sm:grid-cols-2">
          <SkeletonField hint />
          <SkeletonField hint />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SkeletonField hint />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="size-16 rounded-lg" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="button" disabled>
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
}

function SkeletonField({ hint = false }: { hint?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-full rounded-lg" />
      {hint ? <Skeleton className="h-3 w-44" /> : null}
    </div>
  );
}

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const queryClient = useQueryClient();
  const create = $api.useMutation("post", "/api/categories");
  const update = $api.useMutation("put", "/api/categories/{id}");
  const uploading = useIsMutating({ mutationKey: ["post", "/api/media/images"] }) > 0;
  const all = useQuery(allCategoriesQuery);
  const parents = parentChoices(all.data ?? [], category?.id);
  // A new category's slug follows its name until it is typed in by hand; an existing
  // one keeps its slug, since the storefront's links are built on it.
  const [slugTyped, setSlugTyped] = useState(Boolean(category));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? valuesOf(category) : emptyCategory,
  });

  async function onSubmit(values: CategoryValues) {
    try {
      const body = toRequest(values, category);
      const saved = category?.id
        ? await update.mutateAsync({ params: { path: { id: category.id } }, body })
        : await create.mutateAsync({ body });
      void refreshCategories(queryClient);
      if (category) {
        toast.success("Category updated", { description: `“${nameOf(saved)}” was saved.` });
      } else {
        toast.success("Category added", {
          description: `“${nameOf(saved)}” is in the catalog.`,
        });
      }
      onDone();
    } catch (error) {
      const { message, fields } = problemOf(error);
      const known = fields.filter((field) => fieldNames[field.field]);
      for (const field of known) {
        setError(fieldNames[field.field]!, { message: field.message });
      }
      // 409 is the API saying another category already has this slug.
      if (known.length === 0 && statusOf(error) === 409) setError("slug", { message });
      // The dialog stays open, so what was typed can be fixed and sent again.
      toast.error(category ? "Couldn't update the category" : "Couldn't add the category", {
        description: known.length > 0 ? "Check the highlighted fields." : message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="contents">
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.nameEn)}>
            <FieldLabel htmlFor="category-name-en">Name (English)</FieldLabel>
            <Input
              id="category-name-en"
              autoComplete="off"
              placeholder="e.g. Electronics"
              aria-invalid={Boolean(errors.nameEn)}
              {...register("nameEn", {
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                  if (slugTyped) return;
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: isSubmitted,
                  });
                },
              })}
            />
            <FieldError errors={[errors.nameEn]} />
          </Field>

          <Field data-invalid={Boolean(errors.nameBn)}>
            <FieldLabel htmlFor="category-name-bn">
              Name (Bangla)
              <span className="font-normal text-muted-foreground">Optional</span>
            </FieldLabel>
            <Input
              id="category-name-bn"
              lang="bn"
              autoComplete="off"
              placeholder="যেমন: ইলেকট্রনিক্স"
              aria-invalid={Boolean(errors.nameBn)}
              {...register("nameBn")}
            />
            <FieldError errors={[errors.nameBn]} />
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.slug)}>
          <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
          <Input
            id="category-slug"
            autoComplete="off"
            spellCheck={false}
            placeholder="e.g. electronics"
            className="font-mono"
            aria-invalid={Boolean(errors.slug)}
            {...register("slug", { onChange: () => setSlugTyped(true) })}
          />
          <FieldDescription className="text-xs">
            The category&apos;s name in storefront links: lowercase letters, numbers and
            hyphens.
          </FieldDescription>
          <FieldError errors={[errors.slug]} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.parentId)}>
            <FieldLabel htmlFor="category-parent">Parent category</FieldLabel>
            <Controller
              control={control}
              name="parentId"
              render={({ field }) => (
                // "" leaves the Select on its placeholder, which reads as the top level.
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value === TOP_LEVEL ? "" : value)}
                  disabled={all.isPending}
                >
                  <SelectTrigger
                    id="category-parent"
                    className="w-full"
                    aria-invalid={Boolean(errors.parentId)}
                  >
                    <SelectValue
                      placeholder={all.isPending ? "Loading categories…" : "None (top level)"}
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    <SelectItem value={TOP_LEVEL}>None (top level)</SelectItem>
                    {parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription className="text-xs">
              {all.isError
                ? "Couldn't load the categories to choose from."
                : "Leave empty for a top-level category."}
            </FieldDescription>
            <FieldError errors={[errors.parentId]} />
          </Field>

          <Field data-invalid={Boolean(errors.visibility)}>
            <FieldLabel htmlFor="category-visibility">Visibility</FieldLabel>
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="category-visibility"
                    className="w-full"
                    aria-invalid={Boolean(errors.visibility)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldDescription className="text-xs">
              Hidden keeps it off the storefront.
            </FieldDescription>
            <FieldError errors={[errors.visibility]} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.sortOrder)}>
            <FieldLabel htmlFor="category-sort-order">Sort order</FieldLabel>
            <Input
              id="category-sort-order"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 10"
              aria-invalid={Boolean(errors.sortOrder)}
              {...register("sortOrder")}
            />
            <FieldDescription className="text-xs">
              Lower numbers come first; empty is 0.
            </FieldDescription>
            <FieldError errors={[errors.sortOrder]} />
          </Field>

          <Field data-invalid={Boolean(errors.icon)}>
            <FieldLabel htmlFor="category-icon">Icon</FieldLabel>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <IconUpload
                  id="category-icon"
                  value={field.value}
                  onChange={field.onChange}
                  invalid={Boolean(errors.icon)}
                />
              )}
            />
            <FieldError errors={[errors.icon]} />
          </Field>
        </div>
      </FieldGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving…" : category ? "Save changes" : "Add category"}
        </Button>
      </DialogFooter>
    </form>
  );
}
