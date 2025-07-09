import type { Condition, FilterGroup, Filter } from "@lens2/types/filters";
import { OPERATORS_WITHOUT_VALUE } from "@lens2/types/filters";

/**
 * Process filters for API consumption
 * Removes empty conditions and groups
 */
export function processFiltersForAPI(filters: Filter): FilterGroup | null {
  // Handle empty filter object
  if (!('op' in filters) || !('conditions' in filters)) {
    return null;
  }
  return cleanFilterGroup(filters as FilterGroup);
}

/**
 * Clean a filter group by removing empty conditions and groups
 */
function cleanFilterGroup(group: FilterGroup): FilterGroup {
  const cleanedConditions = group.conditions
    .map(item => {
      if ("conditions" in item) {
        // It's a nested group
        const cleanedGroup = cleanFilterGroup(item);
        // Only include groups that have conditions
        return cleanedGroup.conditions.length > 0 ? cleanedGroup : null;
      } else {
        // It's a condition
        return cleanCondition(item);
      }
    })
    .filter((item): item is Condition | FilterGroup => item !== null);

  return {
    op: group.op,
    conditions: cleanedConditions,
  };
}

/**
 * Clean a condition by removing invalid ones
 */
function cleanCondition(condition: Condition): Condition | null {
  // Remove conditions without attributes
  if (!condition.attribute) {
    return null;
  }

  // Remove conditions with empty string values (but keep other falsy values like 0, false)
  if (condition.value === "" || condition.value === undefined) {
    // Check if operator requires a value
    if (condition.op && !OPERATORS_WITHOUT_VALUE.includes(condition.op)) {
      return null;
    }
  }

  return condition;
}

/**
 * Check if filters are empty
 */
export function isFiltersEmpty(filters: Filter): boolean {
  // Handle empty filter object
  if (!('op' in filters) || !('conditions' in filters)) {
    return true;
  }
  const cleaned = processFiltersForAPI(filters);
  return !cleaned || cleaned.conditions.length === 0;
}

/**
 * Initialize empty filters
 */
export function initializeFilters(): FilterGroup {
  return {
    op: "and",
    conditions: [],
  };
}
