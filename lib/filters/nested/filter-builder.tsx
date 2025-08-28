import { useLensContext } from "@lens2/contexts/lens-context";
import { OptionsCacheProvider } from "@lens2/contexts/options-cache-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { FilterGroupComponent } from "@lens2/filters/nested/filter-group";
import { createEmptyCondition } from "@lens2/filters/logic/initialize-filter";
import { normalizeFilters } from "@lens2/filters/logic/process-filters";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Switch } from "@lens2/shadcn/components/ui/switch";
import { cn } from "@lens2/shadcn/lib/utils";
import type { Filter, FilterGroup } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";
import { Code, Plus } from "lucide-react";
import React, { useState } from "react";

export interface NestedFilterBuilderProps {
  value?: Filter;
  onChange?: (filter: Filter) => void;
  className?: string;
  maxDepth?: number;
  onClose?: () => void;
}

export const NestedFilterBuilder: React.FC<NestedFilterBuilderProps> = ({
  value,
  onChange,
  className,
  maxDepth = 1,
  onClose,
}) => {
  const { filters: contextFilters, setFilters } = useViewContext();
  const { attributes: contextAttributes, filterableAttributes } =
    useLensContext();

  // Transform filterable attributes for dropdown display
  const attributes = React.useMemo(() => {
    return Object.entries(filterableAttributes).map(([key, attr]) => ({
      value: key,
      label: attr.label || key,
    }));
  }, [filterableAttributes]);

  const [filter, setFilter] = useState<Filter>(() => {
    const initial = value || contextFilters || {};
    // Normalize filters to ensure consistent property order
    const normalized =
      Object.keys(initial).length > 0 ? normalizeFilters(initial) : initial;
    logger.debug("FilterBuilder mounted", {
      value,
      contextFilters,
      initial,
      normalized,
    });
    return normalized;
  });

  const [showJson, setShowJson] = useState(false);

  const handleChange = (newFilter: Filter) => {
    setFilter(newFilter);
    onChange?.(newFilter);
  };

  const clearAll = () => {
    const emptyFilter = {};
    setFilter(emptyFilter);
    // Don't call onChange here - wait for user to click Apply
    // This prevents the immediate API call on clear
  };

  const addFirstCondition = () => {
    const newFilter: FilterGroup = {
      op: "and",
      conditions: [createEmptyCondition("", contextAttributes)],
    };
    handleChange(newFilter);
  };

  const handleGroupChange = (newGroup: FilterGroup) => {
    // Check if we can flatten - if there's only one group and it contains only conditions
    if (
      newGroup.conditions.length === 1 &&
      newGroup.conditions.every(item => !("op" in item && "conditions" in item))
    ) {
      // This is a group with only one condition, but we still keep it as a group
      handleChange(newGroup);
    } else if (
      newGroup.conditions.length === 1 &&
      "op" in newGroup.conditions[0] &&
      "conditions" in newGroup.conditions[0]
    ) {
      // If there's only one group left, flatten it
      handleChange(newGroup.conditions[0] as FilterGroup);
    } else {
      handleChange(newGroup);
    }
  };

  const isEmpty = !("op" in filter && "conditions" in filter);

  const handleApply = () => {
    logger.info("Applying filters", { filter });

    // Compare current filter with context filters to avoid unnecessary updates
    const newFilter = isEmpty ? {} : filter;
    const currentContextFilters = contextFilters || {};

    // Deep comparison of filters
    const filtersChanged =
      JSON.stringify(newFilter) !== JSON.stringify(currentContextFilters);

    if (filtersChanged) {
      // Only update if filters have actually changed
      setFilters(newFilter);
    }

    onClose?.(); // Always close the popover
  };

  return (
    <OptionsCacheProvider>
      <div className="flex max-h-[80vh] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium">Filters</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Code className="text-muted-foreground h-3 w-3" />
              <Switch
                checked={showJson}
                onCheckedChange={setShowJson}
                aria-label="Toggle JSON view"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground/70 hover:text-muted-foreground gap-1"
            >
              Clear all
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: "200px", maxHeight: "calc(80vh - 120px)" }}
        >
          {showJson ? (
            <pre className="bg-muted overflow-auto rounded p-4 text-xs">
              {JSON.stringify(filter, null, 2)}
            </pre>
          ) : (
            <div className={cn("w-full", className)}>
              {isEmpty ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-muted-foreground text-sm font-medium">
                      No filters applied
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addFirstCondition}
                      className="text-muted-foreground gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Condition
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FilterGroupComponent
                    group={filter as FilterGroup}
                    onChange={handleGroupChange}
                    level={0}
                    maxDepth={maxDepth}
                    attributes={attributes}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Apply button */}
        <div className="flex justify-end border-t px-4 py-3">
          <Button size="sm" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </OptionsCacheProvider>
  );
};

export default NestedFilterBuilder;
