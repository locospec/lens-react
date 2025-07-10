import type { AttributeType, FilterAttribute } from "@lens2/types/attributes";
import type { Filter, FilterGroup } from "@lens2/types/filters";
import { getDefaultOperator } from "./filter-operators-config";

// Filter types that should be included in simple filters
const SIMPLE_FILTER_TYPES: AttributeType[] = ["enum", "date", "boolean"];

/**
 * Initialize a filter structure from an array of attributes
 * This creates a default filter with conditions for simple filter types
 */
export function initializeFilter(
  attributes: Record<string, FilterAttribute>
): Filter {
  const attributeArray = Object.entries(attributes)
    .map(([key, attr]) => ({
      ...attr,
      value: key,
    }))
    .filter(attr => SIMPLE_FILTER_TYPES.includes(attr.type));

  if (attributeArray.length === 0) {
    return {};
  }

  const filterGroup: FilterGroup = {
    op: "and",
    conditions: attributeArray.map(attr => {
      const defaultOp = getDefaultOperator(attr.type);

      // Set default values based on type
      let defaultValue: any = "";
      if (attr.type === "boolean") {
        defaultValue = undefined; // Boolean operators don't need values
      } else if (attr.type === "enum" && defaultOp === "is_any_of") {
        defaultValue = []; // Multiple selection starts with empty array
      }

      return {
        attribute: attr.value,
        op: defaultOp as any,
        value: defaultValue,
      };
    }),
  };

  return filterGroup;
}

/**
 * Create an empty filter condition for a specific attribute
 */
export function createEmptyCondition(
  attributeKey: string,
  attributes: Record<string, FilterAttribute>
) {
  const attr = attributes[attributeKey];
  if (!attr) {
    return {
      attribute: attributeKey,
      op: undefined,
      value: "",
    };
  }

  const defaultOp = getDefaultOperator(attr.type);
  let defaultValue: any = "";

  if (attr.type === "boolean") {
    defaultValue = undefined;
  } else if (
    attr.type === "enum" &&
    (defaultOp === "is_any_of" || defaultOp === "is_none_of")
  ) {
    defaultValue = [];
  }

  return {
    attribute: attributeKey,
    op: defaultOp as any,
    value: defaultValue,
  };
}
