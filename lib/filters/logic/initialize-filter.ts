import type { Attribute, AttributeType } from "@lens2/types/attributes";
import type {
  ConditionValue,
  Filter,
  FilterGroup,
  Operator,
} from "@lens2/types/filters";

// Filter types that should be included in simple filters
const SIMPLE_FILTER_TYPES: AttributeType[] = ["enum", "date", "boolean"];

/**
 * Initialize a filter structure from an array of attributes
 * This creates a default filter with conditions for simple filter types
 */
export function initializeFilter(
  attributes: Record<string, Attribute>
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
      // Set default values based on type
      let defaultValue: ConditionValue = "";
      if (attr.type === "boolean") {
        defaultValue = null; // Boolean operators don't need values
      } else if (attr.type === "enum" && attr.defaultOperator === "is_any_of") {
        defaultValue = []; // Multiple selection starts with empty array
      }

      return {
        attribute: attr.value,
        op: attr.defaultOperator as Operator,
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
  attributes: Record<string, Attribute>
) {
  const attr = attributes[attributeKey];
  if (!attr) {
    return {
      attribute: attributeKey,
      op: undefined,
      value: "",
    };
  }

  let defaultValue: ConditionValue = "";

  if (attr.type === "boolean") {
    defaultValue = null;
  } else if (
    attr.type === "enum" &&
    (attr.defaultOperator === "is_any_of" ||
      attr.defaultOperator === "is_none_of")
  ) {
    defaultValue = [];
  }

  return {
    attribute: attributeKey,
    op: attr.defaultOperator as Operator,
    value: defaultValue,
  };
}
