import { useViewContext } from "@lens2/contexts/view-context";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { Filter } from "lucide-react";
import { FilterBuilder } from "./filter-builder";
import { SearchBox } from "./search-box";
import { isFiltersEmpty } from "./utils/process-filters";

export function FilterToolbar() {
  const { filters } = useViewContext();
  const hasFilters = !isFiltersEmpty(filters);
  const filterCount = hasFilters ? filters.conditions.length : 0;

  return (
    <div className="flex items-center gap-2 border-b p-2">
      <SearchBox />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
            {filterCount > 0 && (
              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">
                {filterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <FilterBuilder />
        </PopoverContent>
      </Popover>
    </div>
  );
}
