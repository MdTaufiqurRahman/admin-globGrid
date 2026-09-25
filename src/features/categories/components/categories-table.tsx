import { Eye, EyeOff, ImageOff, PenLine, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { nameOf, thumbnailOf, type Category, type Visibility } from "../model";

const COLUMNS = 7;

/**
 * One page of categories. `offset` is how many rows the earlier pages hold,
 * so the serial numbers run on from page to page. `parentPaths` names each
 * parent by its path, and is left out while it loads. `children` stands in
 * for the rows while there are none to show: loading, an error, or no results.
 */
export function CategoriesTable({
  categories,
  offset,
  parentPaths,
  onEdit,
  onDelete,
  children,
}: {
  categories: Category[];
  offset: number;
  parentPaths: Map<string, string> | undefined;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  children?: React.ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableHead className="w-16 pl-4">SL</TableHead>
          <TableHead className="w-16"></TableHead>
          <TableHead>Category Name</TableHead>
          <TableHead>Parent Category</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead className="w-28">Visibility</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {children ??
          categories.map((category, index) => (
            <CategoryRow
              key={category.id ?? category.slug}
              category={category}
              serial={offset + index + 1}
              parentPaths={parentPaths}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
      </TableBody>
    </Table>
  );
}

function CategoryRow({
  category,
  serial,
  parentPaths,
  onEdit,
  onDelete,
}: {
  category: Category;
  serial: number;
  parentPaths: Map<string, string> | undefined;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const name = nameOf(category);
  const bangla = category.name?.bn;

  return (
    <TableRow>
      <TableCell className="pl-4 text-muted-foreground tabular-nums">{serial}</TableCell>
      <TableCell>
        <CategoryIcon url={thumbnailOf(category.icon)} />
      </TableCell>
      <TableCell>
        <div className="font-medium">{name}</div>
        {bangla && bangla !== name ? (
          <div lang="bn" className="text-xs text-muted-foreground">
            {bangla}
          </div>
        ) : null}
      </TableCell>
      <TableCell>
        <ParentCell parentId={category.parentId} paths={parentPaths} />
      </TableCell>
      <TableCell>
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {category.slug}
        </code>
      </TableCell>
      <TableCell>
        <VisibilityBadge visibility={category.visibility} />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end gap-1">
          <RowAction
            label="Edit"
            name={name}
            className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary dark:bg-primary/20 dark:text-sky-400 dark:hover:bg-primary/30 dark:hover:text-sky-400"
            onClick={() => onEdit(category)}
          >
            <PenLine />
          </RowAction>
          <RowAction
            label="Delete"
            name={name}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30"
            onClick={() => onDelete(category)}
          >
            <Trash2 />
          </RowAction>
        </div>
      </TableCell>
    </TableRow>
  );
}

function RowAction({
  label,
  name,
  className,
  onClick,
  children,
}: {
  label: string;
  name: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${label} ${name}`}
          className={className}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** The parent's path, "Top level" without one, or "Unknown" for a parent not in the list. */
function ParentCell({
  parentId,
  paths,
}: {
  parentId: string | undefined;
  paths: Map<string, string> | undefined;
}) {
  if (!parentId) return <span className="text-muted-foreground">Top level</span>;
  if (!paths) return <Skeleton className="h-4 w-24" />;
  return paths.get(parentId) ?? <span className="text-muted-foreground">Unknown</span>;
}

/** The category's icon, or a blank tile without one — or when its presigned URL has run out. */
function CategoryIcon({ url }: { url: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted-foreground">
      {url && failed !== url ? (
        <img
          src={url}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFailed(url)}
        />
      ) : (
        <ImageOff className="size-4" aria-label="No icon" />
      )}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility | undefined }) {
  if (visibility === "HIDDEN") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <EyeOff data-icon="inline-start" />
        Hidden
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Eye data-icon="inline-start" />
      Public
    </Badge>
  );
}

/** Placeholder rows while the first page loads, the table's shape already in place. */
export function CategoriesTableSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell className="pl-4">
        <Skeleton className="h-4 w-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="size-9 rounded-lg" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end gap-1">
          <Skeleton className="size-7" />
          <Skeleton className="size-7" />
        </div>
      </TableCell>
    </TableRow>
  ));
}

/** A single row spanning the table, for an error or an empty result. */
export function CategoriesTableMessage({ children }: { children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMNS} className="p-0 whitespace-normal">
        {children}
      </TableCell>
    </TableRow>
  );
}
