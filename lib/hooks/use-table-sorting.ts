import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import * as logger from "@lens2/utils/logger";
import {
  clearAllSorts,
  getSortState,
  removeSortByAttribute,
  toggleSort,
  updateSortDirection,
} from "@lens2/utils/sort-utils";
import { useCallback, useMemo } from "react";

/**
 * Custom hook for table sorting functionality
 * Centralizes all sorting logic and state management
 */
export function useTableSorting() {
  // Get sorting state and handlers from ViewContext
  const { sorts, setSorts } = useViewContext();

  // Get attributes for sortable check
  const { attributes } = useLensContext();

  // Memoize sort states for all columns to prevent recalculation on every render
  const sortStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof getSortState>> = {};
    Object.keys(attributes).forEach(columnId => {
      states[columnId] = getSortState(sorts, columnId);
    });
    return states;
  }, [sorts, attributes]);

  // Sorting handlers
  const handleSortToggle = useCallback(
    (attribute: string) => {
      logger.debug("handleSortToggle called", {
        attribute,
        currentSorts: sorts,
        sortCount: sorts.length,
      });
      const newSorts = toggleSort(sorts, attribute);
      logger.debug("handleSortToggle result", {
        newSorts,
        newSortCount: newSorts.length,
      });
      setSorts(newSorts);
    },
    [sorts, setSorts]
  );

  const handleSortDirection = useCallback(
    (attribute: string, direction: "asc" | "desc") => {
      logger.debug("handleSortDirection called", { attribute, direction });
      setSorts(updateSortDirection(sorts, attribute, direction));
    },
    [sorts, setSorts]
  );

  const handleSortRemove = useCallback(
    (attribute: string) => {
      logger.debug("handleSortRemove called", { attribute });
      setSorts(removeSortByAttribute(sorts, attribute));
    },
    [sorts, setSorts]
  );

  const handleSortsClear = useCallback(() => {
    logger.debug("handleSortsClear called");
    setSorts(clearAllSorts());
  }, [setSorts]);

  const handleSortsReorder = useCallback(
    (reorderedSorts: typeof sorts) => {
      logger.debug("handleSortsReorder called", { reorderedSorts });
      setSorts(reorderedSorts);
    },
    [setSorts]
  );

  // Helper function to get sort state for a specific column
  const getSortStateForColumn = useCallback(
    (columnId: string) => {
      return sortStates[columnId] || getSortState(sorts, columnId);
    },
    [sortStates, sorts]
  );

  // Helper function to check if a column is sortable
  const isColumnSortable = useCallback(
    (columnId: string) => {
      return attributes[columnId]?.sortable === true;
    },
    [attributes]
  );

  return {
    // State
    sorts,
    sortStates,

    // Handlers
    handleSortToggle,
    handleSortDirection,
    handleSortRemove,
    handleSortsClear,
    handleSortsReorder,

    // Helpers
    getSortStateForColumn,
    isColumnSortable,
  };
}
