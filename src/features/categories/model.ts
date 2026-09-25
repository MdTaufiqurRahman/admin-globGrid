import type { components } from "@/lib/api/schema";

export type Category = components["schemas"]["CategoryResponse"];
export type CategoryRequest = components["schemas"]["CategoryRequest"];
export type Visibility = CategoryRequest["visibility"];
type Media = components["schemas"]["MediaResponse"];

/** Rows on one page of the list. */
export const PAGE_SIZE = 10;

/** The name to show: English first, then Bangla, then any locale the category has. */
export function nameOf(category: Category) {
  const name = category.name ?? {};
  return name.en || name.bn || Object.values(name)[0] || category.slug || "Untitled";
}

/**
 * A presigned URL for showing the media small. The API names its variants
 * (`thumbnail`, `listing`, `detail`); the thumbnail is the smallest.
 */
export function thumbnailOf(media: Media | null | undefined) {
  const urls = media?.urls ?? {};
  return urls.thumbnail ?? Object.values(urls)[0] ?? null;
}

/** Each category's path by its id, root first: "Electronics › Mobile Phones". */
export function pathsOf(all: Category[]) {
  const byId = new Map(all.map((category) => [category.id, category]));
  return new Map(
    all.flatMap((category) =>
      category.id ? [[category.id, ancestry(category, byId).map(nameOf).join(" › ")]] : [],
    ),
  );
}

/**
 * Every category that can be the parent of `editing`, labelled by its path
 * ("Electronics › Mobile Phones") and sorted by it. `editing` and the
 * categories under it are left out, since either as a parent would loop.
 */
export function parentChoices(all: Category[], editing?: string) {
  const byId = new Map(all.map((category) => [category.id, category]));

  return all
    .flatMap((category) => {
      const path = ancestry(category, byId);
      if (!category.id || (editing && path.some((step) => step.id === editing))) return [];
      return [{ id: category.id, label: path.map(nameOf).join(" › ") }];
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The category and its ancestors, root first. Stops at a parent it has already seen. */
function ancestry(category: Category, byId: Map<string | undefined, Category>) {
  const path = [category];
  const seen = new Set([category.id]);
  let parent = category.parentId ? byId.get(category.parentId) : undefined;
  while (parent && !seen.has(parent.id)) {
    path.unshift(parent);
    seen.add(parent.id);
    parent = parent.parentId ? byId.get(parent.parentId) : undefined;
  }
  return path;
}
