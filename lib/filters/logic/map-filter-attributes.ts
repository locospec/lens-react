import type { Attribute } from "@lens2/types/attributes";
import type { Condition, Filter, FilterGroup } from "@lens2/types/filters";

/**
 * Maps filter attributes based on attribute configuration.
 *
 * This function traverses the filter tree and replaces attribute names with their
 * corresponding filterAttribute values from the attribute configuration. This is
 * necessary when the API expects a different field name for filtering than what
 * is displayed to the user.
 *
 * Example:
 * - User sees and selects: "Customer Name" (attribute key: "customer_name")
 * - API expects: "customer.name" (defined in filterAttribute)
 * - This function converts: { attribute: "customer_name" } → { attribute: "customer.name" }
 *
 * @param filter - The filter object to transform (can be a FilterGroup or EmptyFilter)
 * @param attributes - The attribute configuration containing filterAttribute mappings
 * @returns The transformed filter with mapped attribute names
 */
export function mapFilterAttributes(
  filter: Filter,
  attributes: Record<string, Attribute>
): Filter {
  if (!filter || Object.keys(filter).length === 0) {
    return filter;
  }

  // Handle FilterGroup
  if ("op" in filter && "conditions" in filter) {
    const group = filter as FilterGroup;
    return {
      ...group,
      conditions: group.conditions.map(item => {
        if ("op" in item && "conditions" in item) {
          // Nested group - we know this is a FilterGroup, not EmptyFilter
          return mapFilterAttributes(item, attributes) as FilterGroup;
        } else {
          // Condition
          return mapConditionAttribute(item as Condition, attributes);
        }
      }),
    };
  }

  return filter;
}

/**
 * Maps a single condition's attribute name to its API field name.
 *
 * This function checks if the attribute has a different filterAttribute defined
 * in its configuration and replaces the attribute name accordingly. This handles
 * cases where the internal field name differs from the API field name.
 *
 * Example transformations:
 * - { attribute: "status", op: "is", value: "active" }
 *   → { attribute: "order_status", op: "is", value: "active" } (if filterAttribute = "order_status")
 *
 * - { attribute: "created_at", op: "after", value: "2024-01-01" }
 *   → { attribute: "created_at", op: "after", value: "2024-01-01" } (no change if filterAttribute not defined)
 *
 * @param condition - The condition object containing the attribute to map
 * @param attributes - The attribute configuration containing filterAttribute mappings
 * @returns The condition with its attribute name mapped to the API field name
 */
function mapConditionAttribute(
  condition: Condition,
  attributes: Record<string, Attribute>
): Condition {
  const attributeConfig = attributes[condition.attribute];

  // If no attribute config or no filterAttribute, use as-is
  if (!attributeConfig?.filterAttribute) {
    return condition;
  }

  // If filterAttribute differs from the condition attribute, map it
  if (attributeConfig.filterAttribute !== condition.attribute) {
    return {
      ...condition,
      attribute: attributeConfig.filterAttribute,
    };
  }

  return condition;
}
