import type { AttributeType } from "@lens2/types/attributes";
import type { OperatorDefinition } from "@lens2/types/filters";

// Null operators for nullable fields
export const NULL_OPERATORS: OperatorDefinition[] = [
  { value: "is_empty", label: "Is empty", requiresValue: false },
  { value: "is_not_empty", label: "Is not empty", requiresValue: false },
];

// String and text operators
export const STRING_OPERATORS: OperatorDefinition[] = [
  { value: "is", label: "Is", requiresValue: true },
  { value: "is_not", label: "Is not", requiresValue: true },
  { value: "contains", label: "Contains", requiresValue: true },
  { value: "not_contains", label: "Does not contain", requiresValue: true },
  { value: "starts_with", label: "Starts with", requiresValue: true },
  { value: "ends_with", label: "Ends with", requiresValue: true },
  { value: "matches_regex", label: "Matches regex", requiresValue: true },
  {
    value: "is_any_of",
    label: "Is any of",
    requiresValue: true,
    multiple: true,
  },
  {
    value: "is_none_of",
    label: "Is none of",
    requiresValue: true,
    multiple: true,
  },
];

// Number operators (integer, decimal)
export const NUMBER_OPERATORS: OperatorDefinition[] = [
  { value: "is", label: "Is", requiresValue: true },
  { value: "is_not", label: "Is not", requiresValue: true },
  { value: "greater_than", label: "Greater than", requiresValue: true },
  { value: "less_than", label: "Less than", requiresValue: true },
  {
    value: "greater_than_or_equal",
    label: "Greater than or equal",
    requiresValue: true,
  },
  {
    value: "less_than_or_equal",
    label: "Less than or equal",
    requiresValue: true,
  },
  {
    value: "between",
    label: "Between",
    requiresValue: true,
    valueType: "range",
  },
  {
    value: "not_between",
    label: "Not between",
    requiresValue: true,
    valueType: "range",
  },
];

// Date and datetime operators
export const DATE_OPERATORS: OperatorDefinition[] = [
  { value: "is", label: "Is", requiresValue: true },
  { value: "is_not", label: "Is not", requiresValue: true },
  { value: "greater_than", label: "Greater than", requiresValue: true },
  { value: "less_than", label: "Less than", requiresValue: true },
  {
    value: "greater_than_or_equal",
    label: "Greater than or equal",
    requiresValue: true,
  },
  {
    value: "less_than_or_equal",
    label: "Less than or equal",
    requiresValue: true,
  },
  {
    value: "between",
    label: "Between",
    requiresValue: true,
    valueType: "range",
  },
  {
    value: "not_between",
    label: "Not between",
    requiresValue: true,
    valueType: "range",
  },
];

// Boolean operators
export const BOOLEAN_OPERATORS: OperatorDefinition[] = [
  { value: "is_true", label: "Is true", requiresValue: false },
  { value: "is_false", label: "Is false", requiresValue: false },
];

// Enum operators
export const ENUM_OPERATORS: OperatorDefinition[] = [
  { value: "is", label: "Is", requiresValue: true },
  { value: "is_not", label: "Is not", requiresValue: true },
  {
    value: "is_any_of",
    label: "Is any of",
    requiresValue: true,
    multiple: true,
  },
  {
    value: "is_none_of",
    label: "Is none of",
    requiresValue: true,
    multiple: true,
  },
];

// Map lens-react-2 attribute types to operators
export const TYPE_OPERATORS_MAP: Record<AttributeType, OperatorDefinition[]> = {
  string: STRING_OPERATORS,
  text: STRING_OPERATORS,
  longtext: [
    // Limited operators for longtext
    { value: "contains", label: "Contains", requiresValue: true },
    { value: "not_contains", label: "Does not contain", requiresValue: true },
  ],
  integer: NUMBER_OPERATORS,
  number: NUMBER_OPERATORS,
  decimal: NUMBER_OPERATORS,
  date: DATE_OPERATORS,
  datetime: DATE_OPERATORS,
  timestamp: DATE_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  enum: ENUM_OPERATORS,
};

// Get list of supported attribute types from the operators map
export const SUPPORTED_ATTRIBUTE_TYPES = Object.keys(
  TYPE_OPERATORS_MAP
) as AttributeType[];

// Attribute types that support text-based searching (input box)
export const SEARCHABLE_ATTRIBUTE_TYPES: AttributeType[] = [
  "string",
  "text",
  "longtext",
];

// Attribute types that support filtering (dropdowns, pickers, selectors)
export const FILTERABLE_ATTRIBUTE_TYPES: AttributeType[] = [
  "enum",
  "boolean",
  "date",
  "datetime",
  "timestamp",
  "integer",
  "number",
  "decimal",
];

export const SORTABLE_ATTRIBUTE_TYPES: AttributeType[] = [
  "string",
  "text",
  "enum",
];
