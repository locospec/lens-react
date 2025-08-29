import type { AttributeType } from "@lens2/types/attributes";

/**
 * Shared factory functions for value input components
 * Used by both nested and chip filter systems
 */

// Note: isMultipleValueOperator functionality moved to filter-operators-config.ts
// as operatorExpectsMultiple() since it's operator-related logic

/**
 * Determine input strategy based on attribute configuration
 */
export function determineInputStrategy(attribute: {
  type?: AttributeType;
  options?: Array<{ label: string; value: string; count?: number }>;
  optionsAggregator?: any;
}): "dynamic_options" | "static_options" | "date_input" | "simple_input" {
  // Check for date types first
  if (attribute.type && isDateType(attribute.type)) {
    return "date_input";
  }

  if (attribute.optionsAggregator) {
    return "dynamic_options";
  }

  if (attribute.options && attribute.options.length > 0) {
    return "static_options";
  }

  return "simple_input";
}

/**
 * Check if attribute type is a date type
 */
export function isDateType(type: AttributeType): boolean {
  return type === "date" || type === "datetime" || type === "timestamp";
}

/**
 * Get appropriate HTML input type based on attribute type
 */
export function getInputTypeForAttributeType(type: AttributeType): string {
  switch (type) {
    case "integer":
    case "number":
    case "decimal":
      return "number";
    case "date":
      return "date";
    case "datetime":
    case "timestamp":
      return "datetime-local";
    default:
      return "text";
  }
}

/**
 * Get placeholder text based on attribute type
 */
export function getPlaceholderForType(type: AttributeType): string {
  switch (type) {
    case "integer":
    case "number":
    case "decimal":
      return "Enter number";
    case "date":
      return "Select date";
    case "datetime":
    case "timestamp":
      return "Select date and time";
    case "boolean":
      return "true or false";
    default:
      return "Enter value";
  }
}

/**
 * Format a value for display in chip filters
 */
export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toLocaleDateString();

  if (Array.isArray(value)) {
    if (value.length === 0) return "empty";

    // Special formatting for date ranges
    if (
      value.length === 2 &&
      typeof value[0] === "string" &&
      typeof value[1] === "string"
    ) {
      // Check if these look like ISO date strings
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value[0]) && dateRegex.test(value[1])) {
        const startDate = new Date(value[0] + "T00:00:00");
        const endDate = new Date(value[1] + "T00:00:00");
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
    }

    return value.join(", ");
  }

  // Check if this is a date string
  if (typeof value === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(value)) {
      const date = new Date(value + "T00:00:00");
      return date.toLocaleDateString();
    }
  }

  return String(value);
}

/**
 * Generate placeholder text for selection inputs
 */
export function getSelectionPlaceholder(isMultiple: boolean): string {
  return isMultiple ? "Select values..." : "Select value";
}

/**
 * Generate search placeholder text for attribute
 */
export function getSearchPlaceholder(attributeLabel: string): string {
  return `Search ${attributeLabel.toLowerCase()}...`;
}

/**
 * Generate empty text for attribute
 */
export function getEmptyText(attributeLabel: string): string {
  return `No ${attributeLabel.toLowerCase()} found.`;
}
