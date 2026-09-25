import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Radix's Select has no empty value, so "no filter" goes by this one. */
const ALL = "all";

/**
 * A dropdown that narrows a list to one value, or to none of them with
 * `allLabel`. `value` is undefined while the list is not filtered.
 */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  label,
  className,
}: {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: readonly { value: T; label: string }[];
  allLabel: string;
  label: string;
  className?: string;
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : (next as T))}
    >
      <SelectTrigger aria-label={label} className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
