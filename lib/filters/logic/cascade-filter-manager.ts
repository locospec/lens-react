import type { ChipFilter } from "@lens2/filters/chip/types";
import type { Attribute } from "@lens2/types/attributes";
import type { Condition, Filter, FilterGroup } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";

// Options to track action context
export interface CascadeContext {
  isUserAction: boolean;
  sourceAttribute: string;
  action: "add" | "update" | "remove";
  previousValue?: unknown;
  newValue?: unknown;
}

// ============ CORE FUNCTIONS ============

/**
 * Apply cascade clearing to chip filters (flat structure)
 * When a parent filter VALUE changes, all dependent child filters are cleared
 * When a parent filter is REMOVED, child filters remain but will show all options
 */
export function applyCascadeToChipFilters(
  filters: ChipFilter[],
  context: CascadeContext,
  attributes: Record<string, Attribute>
): ChipFilter[] {
  if (!context.isUserAction) {
    // Don't cascade for programmatic changes
    return filters;
  }

  // If removing a parent filter, don't clear children
  // Children will automatically show all options when parent constraint is gone
  if (context.action === "remove") {
    return filters;
  }

  // Only clear children when parent VALUE changes (add or update)
  // This prevents stale child selections that don't match the new parent
  if (context.action === "update" || context.action === "add") {
    // Only proceed if the value actually changed
    if (
      context.action === "update" &&
      context.previousValue === context.newValue
    ) {
      return filters;
    }

    // Find all dependent attributes that need clearing
    const dependentAttributes = findAllDependents(
      context.sourceAttribute,
      attributes
    );

    if (dependentAttributes.length === 0) {
      return filters;
    }

    // Log the cascade action
    logCascadeAction(context, dependentAttributes);

    // Clear dependent filters
    return filters.filter(f => !dependentAttributes.includes(f.attribute));
  }

  return filters;
}

/**
 * Apply cascade clearing to nested filter groups (recursive structure)
 * Only clears dependent conditions within the same group as the changed parent
 * When parent is removed, children remain (they'll show all options)
 */
export function applyCascadeToFilterGroup(
  filter: Filter,
  context: CascadeContext,
  attributes: Record<string, Attribute>
): Filter {
  if (!context.isUserAction || !filter || !("conditions" in filter)) {
    return filter;
  }

  // If removing a parent filter, don't clear children
  // Children will automatically show all options when parent constraint is gone
  if (context.action === "remove") {
    return filter;
  }

  // Only clear children when parent VALUE changes
  if (
    context.action === "update" &&
    context.previousValue === context.newValue
  ) {
    return filter;
  }

  const dependentAttributes = findAllDependents(
    context.sourceAttribute,
    attributes
  );

  if (dependentAttributes.length === 0) {
    return filter;
  }

  // Log the cascade action
  logCascadeAction(context, dependentAttributes);

  // Important: Only clear within the group containing the source attribute
  return cascadeInFilterGroupSelective(
    filter as FilterGroup,
    context.sourceAttribute,
    dependentAttributes
  );
}

// ============ HELPER FUNCTIONS ============

/**
 * Find all attributes that depend on the given parent attribute
 * Handles multi-level dependencies and multiple parents per attribute
 * e.g., state → district → city → area
 * or city_name depends on both ["district_name", "state_name"]
 */
function findAllDependents(
  parentAttribute: string,
  attributes: Record<string, Attribute>
): string[] {
  const dependents: string[] = [];
  const queue = [parentAttribute];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    // Find direct children
    for (const [attrName, attr] of Object.entries(attributes)) {
      // Check if current attribute is a parent of this attribute
      const parentFilters = attr.parentFilters;
      if (parentFilters) {
        // parentFilters is always an array now
        if (parentFilters.includes(current)) {
          dependents.push(attrName);
          queue.push(attrName); // Check for grandchildren
        }
      }
    }
  }

  return dependents;
}

/**
 * Selectively remove dependent conditions only within the group containing the source attribute
 * This ensures that changing a parent in one group doesn't affect children in other groups
 */
function cascadeInFilterGroupSelective(
  group: FilterGroup,
  sourceAttribute: string,
  attributesToClear: string[]
): Filter {
  // First, check if this group contains the source attribute
  const containsSource = groupContainsAttribute(group, sourceAttribute);

  if (!containsSource) {
    // This group doesn't contain the source, don't modify it
    return group;
  }

  // This group contains the source, clear dependents at this level
  const newConditions = group.conditions
    .map(condition => {
      // Handle nested groups
      if ("op" in condition && "conditions" in condition) {
        const nestedGroup = condition as FilterGroup;

        // Check if the nested group contains the source
        if (groupContainsAttribute(nestedGroup, sourceAttribute)) {
          // Recurse into this group to clear dependents
          const updatedGroup = cascadeInFilterGroupSelective(
            nestedGroup,
            sourceAttribute,
            attributesToClear
          );

          // Remove empty groups
          if (
            !("conditions" in updatedGroup) ||
            updatedGroup.conditions.length === 0
          ) {
            return null;
          }
          return updatedGroup;
        }

        // Nested group doesn't contain source, keep as is
        return nestedGroup;
      }

      // Handle simple conditions
      const cond = condition as Condition;

      // Only clear if it's a dependent AND we're in the same group as the source
      if (attributesToClear.includes(cond.attribute)) {
        return null; // Remove this condition
      }

      return cond;
    })
    .filter((c): c is Condition | FilterGroup => c !== null);

  // If all conditions were removed, return empty filter
  if (newConditions.length === 0) {
    return {} as Filter;
  }

  return {
    ...group,
    conditions: newConditions,
  };
}

/**
 * Check if a filter group contains a specific attribute
 */
function groupContainsAttribute(
  group: FilterGroup,
  attribute: string
): boolean {
  for (const condition of group.conditions) {
    if ("op" in condition && "conditions" in condition) {
      // Nested group - check recursively
      if (groupContainsAttribute(condition as FilterGroup, attribute)) {
        return true;
      }
    } else {
      // Simple condition - check attribute
      const cond = condition as Condition;
      if (cond.attribute === attribute) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if cascade clearing should happen
 * Can be extended with more complex logic if needed
 */
export function shouldCascade(
  context: CascadeContext,
  attributes: Record<string, Attribute>
): boolean {
  // Only cascade on user actions
  if (!context.isUserAction) return false;

  // Only cascade if the source attribute has dependents
  const attr = attributes[context.sourceAttribute];
  if (!attr) return false;

  // Check if any other attributes depend on this one
  const hasDependents = Object.values(attributes).some(a =>
    a.parentFilters?.includes(context.sourceAttribute)
  );

  return hasDependents;
}

// ============ DEBUG UTILITIES ============

/**
 * Log cascade actions for debugging
 */
export function logCascadeAction(
  context: CascadeContext,
  clearedAttributes: string[]
) {
  if (clearedAttributes.length > 0) {
    logger.debug("Cascade clearing triggered", {
      trigger: context.sourceAttribute,
      action: context.action,
      cleared: clearedAttributes,
      isUserAction: context.isUserAction,
      previousValue: context.previousValue,
      newValue: context.newValue,
    });
  }
}
