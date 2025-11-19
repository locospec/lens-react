import { useLensViewContext } from "@lens2/contexts/lens-view-context";
import { chipFiltersToLensViewFilter } from "@lens2/filters/logic/chip-filter-logic";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@lens2/shadcn/components/ui/dropdown-menu";
import type { FilterGroup } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ChipFilter } from "./types";
import { ChipValueInput } from "./value-input";

interface ChipFilterCreatorProps {
  onSessionStart: () => string;
  onSessionEnd: () => void;
  onFilterUpdate: (attribute: string, value: unknown, operator: string) => void;
  sessionFilters: Map<string, ChipFilter>;
  uniqueFilters?: boolean;
  allFilters?: ChipFilter[];
}

export function ChipFilterCreator({
  onSessionStart,
  onSessionEnd,
  onFilterUpdate,
  sessionFilters,
  uniqueFilters,
  allFilters,
}: ChipFilterCreatorProps) {
  const { filterableAttributes } = useLensViewContext();
  const [open, setOpen] = useState(false);

  // Convert allFilters to FilterGroup format for parent filtering
  const currentFiltersAsGroup = useMemo(() => {
    if (!allFilters || allFilters.length === 0) return undefined;
    return chipFiltersToLensViewFilter(allFilters) as FilterGroup;
  }, [allFilters]);

  // Get attribute keys for iteration
  const attributeKeys = Object.keys(filterableAttributes);

  // Filter out already-used attributes if uniqueFilters is true
  const visibleAttributeKeys =
    uniqueFilters === true
      ? attributeKeys.filter(key => !allFilters?.some(f => f.attribute === key))
      : attributeKeys;

  // Handle popover open/close
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);

      if (newOpen) {
        // Start a new session when opening
        onSessionStart();
      } else {
        // End session when closing
        onSessionEnd();
        setOpenSubmenu(null);
      }
    },
    [onSessionStart, onSessionEnd]
  );

  // Track which submenu is open for managing focus
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Handle value change
  const handleValueChange = useCallback(
    (attributeKey: string, value: unknown) => {
      const attribute = filterableAttributes[attributeKey];
      if (!attribute) {
        logger.error(`Attribute ${attributeKey} not found`);
        return;
      }

      onFilterUpdate(attributeKey, value, attribute.defaultOperator);
    },
    [filterableAttributes, onFilterUpdate]
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-96 w-64 overflow-y-auto"
      >
        {visibleAttributeKeys.map(key => {
          const attr = filterableAttributes[key];
          const currentFilter = sessionFilters.get(key);

          return (
            <DropdownMenuSub
              key={key}
              open={openSubmenu === key}
              onOpenChange={isOpen => setOpenSubmenu(isOpen ? key : null)}
            >
              <DropdownMenuSubTrigger className="flex w-full items-center justify-between">
                <span>{attr.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-64">
                  <div className="p-2">
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      Filter by {attr.label}
                    </div>
                    <ChipValueInput
                      attribute={attr}
                      value={currentFilter?.value ?? ""}
                      operator={currentFilter?.operator || attr.defaultOperator}
                      onChange={value => handleValueChange(key, value)}
                      className="w-full"
                      isEditing={true}
                      currentFilters={currentFiltersAsGroup}
                      uniqueFilters={uniqueFilters}
                    />
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
        {visibleAttributeKeys.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            All attributes are already filtered
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            Hover over an attribute to filter
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
