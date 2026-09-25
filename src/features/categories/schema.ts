import { z } from "zod";
import { thumbnailOf, type Category, type CategoryRequest } from "./model";

/** The API's slug rule: lowercase letters and digits, joined by single hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  nameEn: z.string().trim().min(1, "Enter the English name"),
  nameBn: z.string().trim(),
  slug: z
    .string()
    .trim()
    .min(1, "Enter a slug")
    .max(160, "Keep the slug to 160 characters")
    .regex(SLUG, "Use lowercase letters and numbers, joined by single hyphens"),
  /** The parent's id, or "" for a top-level category. */
  parentId: z.string(),
  /** Kept as typed, so a new category's box can start empty; empty goes out as 0. */
  sortOrder: z
    .string()
    .trim()
    .regex(/^-?\d*$/, "Enter a whole number"),
  visibility: z.enum(["PUBLIC", "HIDDEN"]),
  /** The uploaded icon, with a URL to preview it by when the API gave one. */
  icon: z.object({ id: z.string(), url: z.string().nullable() }).nullable(),
});

export type CategoryValues = z.infer<typeof categorySchema>;

export const emptyCategory: CategoryValues = {
  nameEn: "",
  nameBn: "",
  slug: "",
  parentId: "",
  sortOrder: "",
  visibility: "PUBLIC",
  icon: null,
};

export function valuesOf(category: Category): CategoryValues {
  return {
    nameEn: category.name?.en ?? "",
    nameBn: category.name?.bn ?? "",
    slug: category.slug ?? "",
    parentId: category.parentId ?? "",
    sortOrder: String(category.sortOrder ?? 0),
    visibility: category.visibility ?? "PUBLIC",
    icon: category.iconMediaId
      ? { id: category.iconMediaId, url: thumbnailOf(category.icon) }
      : null,
  };
}

/**
 * The form as the API takes it. An update replaces the whole category, so
 * the locales this form does not edit are carried over from `current`.
 */
export function toRequest(values: CategoryValues, current?: Category): CategoryRequest {
  const { en: _en, bn: _bn, ...otherLocales } = current?.name ?? {};

  return {
    name: {
      ...otherLocales,
      en: values.nameEn,
      ...(values.nameBn ? { bn: values.nameBn } : {}),
    },
    slug: values.slug,
    parentId: values.parentId || undefined,
    sortOrder: Number(values.sortOrder || 0),
    visibility: values.visibility,
    iconMediaId: values.icon?.id,
  };
}

/** A slug made from a name: "Men's Wear" → "mens-wear". */
export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/, "");
}
