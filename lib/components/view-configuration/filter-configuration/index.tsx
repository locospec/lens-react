import { FilterBuilder } from "@lens2/components/filters/filter-builder";
import { isFiltersEmpty } from "@lens2/components/filters/utils/process-filters";
import { useViewContext } from "@lens2/contexts/view-context";
import { Filter } from "lucide-react";

export function FilterConfig() {
  const { filters } = useViewContext();
  const isEmpty = isFiltersEmpty(filters);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <div>
            <h3 className="text-sm font-medium">Filters</h3>
            <p className="text-muted-foreground text-xs">
              {isEmpty
                ? "Add conditions to filter your data"
                : `${filters.conditions.length} condition${filters.conditions.length !== 1 ? "s" : ""} applied`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Builder */}
      <div className="flex-1 overflow-y-auto p-4">
        <FilterBuilder maxDepth={3} showClearAll={true} />
      </div>

      {/* Footer with info */}
      <div className="bg-muted/50 border-t px-4 py-3">
        <p className="text-muted-foreground text-xs">
          Filters are automatically applied as you make changes
        </p>
      </div>
    </div>
  );
}
