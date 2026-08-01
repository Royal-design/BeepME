import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { filterData } from "@/redux/slice/filterSlice";

export function SearchBar() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(filterData(query));
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, dispatch]);

  return (
    <div className="group relative flex items-center">
      <SearchIcon
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute left-3 text-faint"
        aria-hidden
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        aria-label="Search chats and people"
        className="h-9 w-full rounded-lg border border-transparent bg-surface-hover pr-8 pl-9 text-sm text-foreground placeholder:text-faint transition-colors duration-200 focus:border-input focus:bg-surface-raised focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2 grid size-5 place-items-center rounded-full text-faint transition-colors hover:text-foreground"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
