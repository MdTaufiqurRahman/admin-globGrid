import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { $api } from "@/lib/api/client";
import { problemOf, statusOf } from "@/lib/api/problems";
import { refreshCategories } from "../api";
import { nameOf, type Category } from "../model";

/**
 * Asks before deleting `category`. The API refuses a category that still has
 * subcategories or products (409); its reason comes up in a toast.
 */
export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {category ? (
          <ConfirmDelete
            key={category.id}
            category={category}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmDelete({ category, onDone }: { category: Category; onDone: () => void }) {
  const queryClient = useQueryClient();
  const remove = $api.useMutation("delete", "/api/categories/{id}");
  const name = nameOf(category);

  async function confirm() {
    if (!category.id) return;
    try {
      await remove.mutateAsync({ params: { path: { id: category.id } } });
      void refreshCategories(queryClient);
      toast.success("Category deleted", { description: `“${name}” is gone from the catalog.` });
      onDone();
    } catch (error) {
      toast.error(`Couldn't delete “${name}”`, { description: problemOf(error).message });
      // A 409 is a refusal (it still has subcategories or products): asking again changes
      // nothing, so the dialog closes. Anything else, such as a dropped connection, can be retried.
      if (statusOf(error) === 409) onDone();
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive">
          <Trash2 />
        </AlertDialogMedia>
        <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
        <AlertDialogDescription>
          This can&apos;t be undone. A category that still has subcategories or products
          can&apos;t be deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
        {/* A plain button, not AlertDialogAction, which would close before the API answers. */}
        <Button
          variant="destructive"
          disabled={remove.isPending}
          onClick={() => void confirm()}
        >
          {remove.isPending ? "Deleting…" : "Delete"}
        </Button>
      </AlertDialogFooter>
    </>
  );
}
