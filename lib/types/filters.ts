// Filter types matching lens-react structure
export type GroupOperator = "and" | "or";
export type Operator =
  // String operators
  | "is"
  | "is_not"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "is_empty"
  | "is_not_empty"
  // Number operators
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "between"
  | "not_between"
  // Date operators
  | "before"
  | "after"
  // Enum operators
  | "is_any_of"
  | "is_none_of"
  // Boolean operators
  | "is_true"
  | "is_false";

export interface Condition {
  attribute: string;
  op?: Operator;
  value?: string | number | boolean | string[] | number[] | null;
}

export interface FilterGroup {
  op: GroupOperator;
  conditions: Array<Condition | FilterGroup>;
}

export type EmptyFilter = Record<string, never>;
export type Filter = FilterGroup | EmptyFilter;

// Extend Attribute for filter-specific properties
import type { Attribute } from "../contexts/view-context";

export interface FilterAttribute extends Attribute {
  // Filter-specific properties
  dependsOn?: string[]; // For dependent dropdowns
  relatedModelName?: string; // For API-based enum options
  options?: Array<{ label: string; value: string }>; // Static enum options
  selectionType?: "single" | "multiple"; // For enum fields
  isNullable?: boolean; // Allow null values
}

// Operator metadata
export interface OperatorDefinition {
  value: Operator;
  label: string;
  requiresValue: boolean;
  valueType?: "single" | "range";
  multiple?: boolean;
}

// Operators that don't require values
export const OPERATORS_WITHOUT_VALUE: Operator[] = [
  "is_empty",
  "is_not_empty",
  "is_true",
  "is_false",
];

// Operators that expect range values
export const RANGE_OPERATORS: Operator[] = ["between", "not_between"];

// Operators that expect multiple values
export const MULTIPLE_VALUE_OPERATORS: Operator[] = ["is_any_of", "is_none_of"];
