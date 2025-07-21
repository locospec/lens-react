import { ChipFilter } from "@lens2/filters/chip/types";
import type { Attribute } from "@lens2/types/attributes";
import type {
  Condition,
  ConditionValue,
  Filter,
  FilterGroup,
  Operator,
} from "@lens2/types/filters";

/**
 * Create a new chip filter for an attribute
 */
let filterIdCounter = 0;

export function createChipFilter(
  attribute: Attribute,
  attributeKey: string,
  value: unknown,
  existingId?: string
): ChipFilter {
  return {
    id: existingId || `chip-${attributeKey}-${Date.now()}-${++filterIdCounter}`,
    attribute: attributeKey,
    operator: attribute.defaultOperator,
    value,
  };
}

/**
 * Convert chip filters to lens filter format
 */
export function chipFiltersToLensFilter(chipFilters: ChipFilter[]): Filter {
  if (chipFilters.length === 0) {
    return {};
  }

  const conditions: Condition[] = chipFilters.map(filter => ({
    attribute: filter.attribute,
    op: filter.operator as Operator,
    value: filter.value as ConditionValue,
  }));

  const filterGroup: FilterGroup = {
    op: "and",
    conditions,
  };

  return filterGroup;
}

/**
 * Update or remove a chip filter in a collection
 */
export function updateChipFilterCollection(
  filters: Map<string, ChipFilter>,
  attributeKey: string,
  filter: ChipFilter | null
): Map<string, ChipFilter> {
  const newFilters = new Map(filters);

  if (filter === null) {
    newFilters.delete(attributeKey);
  } else {
    newFilters.set(attributeKey, filter);
  }

  return newFilters;
}

/**
 * Check if a value is considered empty for filtering purposes
 */
export function isEmptyFilterValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/**
 * Apply chip filters by converting them to lens format and triggering update
 */
export function applyChipFilters(
  chipFilters: ChipFilter[],
  setFilters: (filters: Filter) => void
): void {
  const lensFilter = chipFiltersToLensFilter(chipFilters);
  setFilters(lensFilter);
}

/**
 * Extract chip filters from lens filter format
 * Takes the first filter group it encounters and converts conditions to chip filters
 * If the group operator is OR, it will be treated as AND for chip filters
 */
export function lensFilterToChipFilters(filter: Filter): ChipFilter[] {
  if (!filter || Object.keys(filter).length === 0) {
    return [];
  }

  // Get the first filter group
  let targetGroup: FilterGroup | null = null;

  // If the filter itself is a group
  if ("op" in filter && "conditions" in filter) {
    targetGroup = filter as FilterGroup;
  }

  // If no group found, return empty
  if (!targetGroup) {
    return [];
  }

  // Convert conditions to chip filters
  const chipFilters: ChipFilter[] = [];

  for (const item of targetGroup.conditions) {
    // Only process direct conditions, not nested groups
    if ("attribute" in item && "op" in item) {
      const condition = item as Condition;
      chipFilters.push({
        id: `chip-${condition.attribute}-${Date.now()}-${++filterIdCounter}`,
        attribute: condition.attribute,
        operator: condition.op as string,
        value: condition.value,
      });
    }
  }

  return chipFilters;
}
