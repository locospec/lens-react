import type { Attribute } from "@lens2/contexts/view-context";
import type { OperatorDefinition } from "@lens2/types/filters";
import {
  MULTIPLE_VALUE_OPERATORS,
  RANGE_OPERATORS,
} from "@lens2/types/filters";

// Map lens-react-2 attribute types to operators
export const OPERATOR_CONFIG: Record<Attribute["type"], OperatorDefinition[]> =
  {
    string: [
      { value: "is", label: "Is", requiresValue: true },
      { value: "is_not", label: "Is not", requiresValue: true },
      { value: "contains", label: "Contains", requiresValue: true },
      { value: "not_contains", label: "Not contains", requiresValue: true },
      { value: "starts_with", label: "Starts with", requiresValue: true },
      { value: "ends_with", label: "Ends with", requiresValue: true },
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
      { value: "is_empty", label: "Is empty", requiresValue: false },
      { value: "is_not_empty", label: "Is not empty", requiresValue: false },
    ],
    text: [
      // Same as string
      { value: "is", label: "Is", requiresValue: true },
      { value: "is_not", label: "Is not", requiresValue: true },
      { value: "contains", label: "Contains", requiresValue: true },
      { value: "not_contains", label: "Not contains", requiresValue: true },
      { value: "starts_with", label: "Starts with", requiresValue: true },
      { value: "ends_with", label: "Ends with", requiresValue: true },
      { value: "is_empty", label: "Is empty", requiresValue: false },
      { value: "is_not_empty", label: "Is not empty", requiresValue: false },
    ],
    longtext: [
      // Same as text but limited operators
      { value: "contains", label: "Contains", requiresValue: true },
      { value: "not_contains", label: "Not contains", requiresValue: true },
      { value: "is_empty", label: "Is empty", requiresValue: false },
      { value: "is_not_empty", label: "Is not empty", requiresValue: false },
    ],
    number: [
      { value: "is", label: "Equals", requiresValue: true },
      { value: "is_not", label: "Not equals", requiresValue: true },
      { value: "greater_than", label: "Greater than", requiresValue: true },
      {
        value: "greater_than_or_equal",
        label: "Greater than or equal",
        requiresValue: true,
      },
      { value: "less_than", label: "Less than", requiresValue: true },
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
    ],
    decimal: [
      // Same as number
      { value: "is", label: "Equals", requiresValue: true },
      { value: "is_not", label: "Not equals", requiresValue: true },
      { value: "greater_than", label: "Greater than", requiresValue: true },
      {
        value: "greater_than_or_equal",
        label: "Greater than or equal",
        requiresValue: true,
      },
      { value: "less_than", label: "Less than", requiresValue: true },
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
    ],
    date: [
      { value: "is", label: "Is", requiresValue: true },
      { value: "is_not", label: "Is not", requiresValue: true },
      { value: "before", label: "Before", requiresValue: true },
      { value: "after", label: "After", requiresValue: true },
      {
        value: "between",
        label: "Between",
        requiresValue: true,
        valueType: "range",
      },
    ],
    datetime: [
      // Same as date but with time
      { value: "is", label: "Is", requiresValue: true },
      { value: "is_not", label: "Is not", requiresValue: true },
      { value: "before", label: "Before", requiresValue: true },
      { value: "after", label: "After", requiresValue: true },
      {
        value: "between",
        label: "Between",
        requiresValue: true,
        valueType: "range",
      },
    ],
    boolean: [
      { value: "is_true", label: "Is true", requiresValue: false },
      { value: "is_false", label: "Is false", requiresValue: false },
    ],
  };

// Get default operator for a given attribute type
export function getDefaultOperator(type: Attribute["type"]): string {
  const operators = OPERATOR_CONFIG[type];
  return operators?.[0]?.value || "is";
}

// Get operators for a given attribute type
export function getOperatorsForType(
  type: Attribute["type"]
): OperatorDefinition[] {
  return OPERATOR_CONFIG[type] || [];
}

// Check if an operator requires a value
export function operatorRequiresValue(
  type: Attribute["type"],
  operator: string
): boolean {
  const operators = OPERATOR_CONFIG[type];
  const operatorDef = operators?.find(op => op.value === operator);
  return operatorDef?.requiresValue ?? true;
}

// Check if an operator expects a range value
export function operatorExpectsRange(operator: string): boolean {
  return RANGE_OPERATORS.includes(operator as any);
}

// Check if an operator expects multiple values
export function operatorExpectsMultiple(operator: string): boolean {
  return MULTIPLE_VALUE_OPERATORS.includes(operator as any);
}
