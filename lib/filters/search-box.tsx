import { useViewContext } from "@lens2/contexts/view-context";
import { useDebouncedState } from "@lens2/hooks/use-debounce";
import { Input } from "@lens2/shadcn/components/ui/input";
import { useCallback, useEffect } from "react";

export function SearchBox() {
  const { search, setSearch } = useViewContext();
  const [localSearch, setLocalSearch, debouncedSearch] = useDebouncedState(
    search,
    300
  );

  // Update search context when debounced value changes
  useEffect(() => {
    const trimmedSearch = debouncedSearch.trim();
    setSearch(trimmedSearch);
  }, [debouncedSearch, setSearch]);

  // Update local search when context search changes (e.g., from external source)
  useEffect(() => {
    setLocalSearch(search);
  }, [search, setLocalSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
    },
    [setLocalSearch]
  );

  return (
    <Input
      type="text"
      placeholder="Search..."
      value={localSearch}
      onChange={handleChange}
      className="w-64"
    />
  );
}
