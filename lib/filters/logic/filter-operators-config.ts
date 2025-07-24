import { NULL_OPERATORS, TYPE_OPERATORS_MAP } from "@lens2/filters/logic/operators";
import type { AttributeType } from "@lens2/types/attributes";
import type { Operator, OperatorDefinition } from "@lens2/types/filters";
import {
  MULTIPLE_VALUE_OPERATORS,
  RANGE_OPERATORS,
} from "@lens2/types/filters";

// Get operators for a given attribute type with nullable support
export function returnOperators(
  type: AttributeType,
  isNullable: boolean
): OperatorDefinition[] {
  const operators = TYPE_OPERATORS_MAP[type];
  if (!operators) {
    console.warn(`No operators defined for type: ${type}`);
    return [];
  }
  if (isNullable) {
    return [...operators, ...NULL_OPERATORS];
  }
  return operators;
}

// Get default operator for a given attribute type
export function getDefaultOperator(type: AttributeType): string {
  // Special defaults for certain types
  switch (type) {
    case "enum":
      return "is_any_of";
    case "boolean":
      return "is_true";
    case "string":
    case "text":
      return "contains";
    default: {
      const operators = TYPE_OPERATORS_MAP[type];
      if (!operators || operators.length === 0) {
        console.warn(`No operators defined for type: ${type}`);
        return "is"; // Default fallback operator
      }
      return operators[0].value;
    }
  }
}

// Get operators for a given attribute type
export function getOperatorsForType(
  type: AttributeType,
  isNullable = false
): OperatorDefinition[] {
  return returnOperators(type, isNullable);
}

// Check if an operator requires a value
export function operatorRequiresValue(
  type: AttributeType,
  operator: string
): boolean {
  const operators = TYPE_OPERATORS_MAP[type];
  const operatorDef = operators?.find(op => op.value === operator);

  // If not found in type-specific operators, check null operators
  if (!operatorDef) {
    const nullOp = NULL_OPERATORS.find(op => op.value === operator);
    return nullOp?.requiresValue ?? true;
  }

  return operatorDef?.requiresValue ?? true;
}

// Check if an operator expects a range value
export function operatorExpectsRange(operator: string): boolean {
  return RANGE_OPERATORS.includes(operator as Operator);
}

// Check if an operator expects multiple values
export function operatorExpectsMultiple(operator: string): boolean {
  return MULTIPLE_VALUE_OPERATORS.includes(operator as Operator);
}
