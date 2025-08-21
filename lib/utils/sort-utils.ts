import type { Sort, SortDirection } from "@lens2/types/view";

/**
 * Toggle sort for an attribute through the cycle: none → ASC → DESC → none
 */
export function toggleSort(currentSorts: Sort[], attribute: string): Sort[] {
  const existingSort = currentSorts.find(sort => sort.attribute === attribute);

  if (!existingSort) {
    // Add new sort as ASC
    return [...currentSorts, { attribute, direction: "asc" }];
  }

  if (existingSort.direction === "asc") {
    // Change to DESC
    return currentSorts.map(sort =>
      sort.attribute === attribute
        ? { ...sort, direction: "desc" as SortDirection }
        : sort
    );
  }

  // Remove sort (was DESC)
  return currentSorts.filter(sort => sort.attribute !== attribute);
}

/**
 * Update the direction of an existing sort
 */
export function updateSortDirection(
  currentSorts: Sort[],
  attribute: string,
  direction: SortDirection
): Sort[] {
  const existingSort = currentSorts.find(sort => sort.attribute === attribute);

  if (!existingSort) {
    // Add new sort with specified direction
    return [...currentSorts, { attribute, direction }];
  }

  // Update existing sort direction
  return currentSorts.map(sort =>
    sort.attribute === attribute ? { ...sort, direction } : sort
  );
}

/**
 * Remove sort for a specific attribute
 */
export function removeSortByAttribute(
  currentSorts: Sort[],
  attribute: string
): Sort[] {
  return currentSorts.filter(sort => sort.attribute !== attribute);
}

/**
 * Clear all sorts
 */
export function clearAllSorts(): Sort[] {
  return [];
}

/**
 * Reorder sorts by moving a sort from one position to another
 */
export function reorderSorts(
  currentSorts: Sort[],
  fromIndex: number,
  toIndex: number
): Sort[] {
  const result = [...currentSorts];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

/**
 * Get the current sort state for an attribute
 */
export function getSortState(
  currentSorts: Sort[],
  attribute: string
): {
  isSorted: boolean;
  direction: SortDirection | null;
  position: number; // 0-based position in sort order, -1 if not sorted
} {
  const sortIndex = currentSorts.findIndex(
    sort => sort.attribute === attribute
  );

  if (sortIndex === -1) {
    return {
      isSorted: false,
      direction: null,
      position: -1,
    };
  }

  return {
    isSorted: true,
    direction: currentSorts[sortIndex].direction,
    position: sortIndex,
  };
}

/**
 * Convert frontend sorts to backend format
 * Frontend uses lowercase 'asc'/'desc', backend expects uppercase 'ASC'/'DESC'
 */
export function convertSortsForAPI(sorts: Sort[]): Array<{
  attribute: string;
  direction: "ASC" | "DESC";
}> {
  return sorts.map(sort => ({
    attribute: sort.attribute,
    direction: sort.direction.toUpperCase() as "ASC" | "DESC",
  }));
}

/**
 * Check if two sort arrays are equivalent
 */
export function areSortsEqual(sorts1: Sort[], sorts2: Sort[]): boolean {
  if (sorts1.length !== sorts2.length) {
    return false;
  }

  return sorts1.every((sort1, index) => {
    const sort2 = sorts2[index];
    return (
      sort1.attribute === sort2.attribute && sort1.direction === sort2.direction
    );
  });
}
