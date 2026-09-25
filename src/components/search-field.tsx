import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

/** How long typing has to pause before the search goes out. */
const DEBOUNCE_MS = 300;

/**
 * A search box for a list whose search lives in the URL. It tells `onSearch`
 * the trimmed text once typing pauses, straight away on Enter or clear, and
 * follows `value` when the URL changes from outside (back, a link).
 */
export function SearchField({
  value,
  onSearch,
  placeholder = "Search…",
  label = "Search",
  className,
}: {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const [text, setText] = useState(value);
  const [followed, setFollowed] = useState(value);
  const timer = useRef<number | undefined>(undefined);

  if (value !== followed) {
    setFollowed(value);
    // Keep what is being typed when it is only the trimmed spaces that differ.
    if (text.trim() !== value) setText(value);
  }

  // A search still waiting when the page goes away must not navigate back to it.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function searchNow(next: string) {
    window.clearTimeout(timer.current);
    onSearch(next.trim());
  }

  function change(next: string) {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSearch(next.trim()), DEBOUNCE_MS);
  }

  return (
    <InputGroup className={className}>
      <InputGroupInput
        type="search"
        value={text}
        placeholder={placeholder}
        aria-label={label}
        enterKeyHint="search"
        className="[&::-webkit-search-cancel-button]:hidden"
        onChange={(event) => change(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") searchNow(text);
        }}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      {text ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => {
              setText("");
              searchNow("");
            }}
          >
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
