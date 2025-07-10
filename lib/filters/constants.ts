/**
 * Filter constants
 */

// Simple operator options for UI dropdown
// This is a simplified list for backward compatibility
// For attribute-specific operators, use filter-operators-config.ts
export const FILTER_OPERATORS = [
  { value: "is", label: "is" },
  { value: "is_not", label: "is not" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "greater_than_or_equal", label: "greater than or equal" },
  { value: "less_than_or_equal", label: "less than or equal" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "not contains" },
  { value: "is_any_of", label: "is any of" },
  { value: "is_none_of", label: "is none of" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
] as const;
