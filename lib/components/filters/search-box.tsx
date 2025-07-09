
import { useState, useEffect, useCallback } from 'react';
import { useViewContext } from '@lens2/contexts/view-context';
import { Input } from '@lens2/shadcn/components/ui/input';

export function SearchBox() {
  const { search, setSearch } = useViewContext();
  const [localSearch, setLocalSearch] = useState(search);
  
  // Debounce search input and trim before setting
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Trim the search string before setting it in context
      const trimmedSearch = localSearch.trim();
      setSearch(trimmedSearch);
    }, 300); // 300ms debounce delay
    
    return () => clearTimeout(timeoutId);
  }, [localSearch, setSearch]);
  
  // Update local search when context search changes (e.g., from external source)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);
  
  return (
    <Input
      type="text"
      placeholder="Search..."
      value={localSearch}
      onChange={handleChange}
      className="w-64"
    />
  );
};