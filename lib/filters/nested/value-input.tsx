import { UnifiedSmartDateInput } from "@lens2/filters/components/unified-smart-date-input";
import {
  operatorExpectsMultiple,
  operatorExpectsRange,
} from "@lens2/filters/logic/filter-operators-config";
import {
  determineInputStrategy,
  getInputTypeForAttributeType,
  getPlaceholderForType,
  getSelectionPlaceholder,
} from "@lens2/filters/logic/value-input-factory";
import { OptionsCombobox } from "@lens2/filters/nested/options-combobox";
import { Input } from "@lens2/shadcn/components/ui/input";
import type { Attribute } from "@lens2/types/attributes";
import type { Condition, FilterGroup } from "@lens2/types/filters";

// Helper function to render value input based on attribute type
export function renderValueInput(
  condition: Condition,
  onChange: (condition: Condition) => void,
  attribute?: Attribute,
  currentFilters?: FilterGroup,
  uniqueFilters?: boolean
) {
  if (!attribute) {
    return null;
  }
  const type = attribute.type;
  const options = attribute.options || [];
  const optionsAggregator = attribute?.optionsAggregator;

  // Use factory functions for shared logic
  const isMultiple = condition.op
    ? operatorExpectsMultiple(condition.op)
    : false;
  const isRange = condition.op ? operatorExpectsRange(condition.op) : false;
  const inputStrategy = determineInputStrategy({
    type: attribute.type,
    options,
    optionsAggregator,
  });

  // Case 1: Use OptionsCombobox for dynamic selection (aggregator-based)
  if (inputStrategy === "dynamic_options") {
    return (
      <OptionsCombobox
        attribute={condition.attribute}
        value={condition.value as string | string[]}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder={getSelectionPlaceholder(isMultiple)}
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
        multiple={isMultiple}
        currentFilters={currentFilters}
        uniqueFilters={uniqueFilters}
      />
    );
  }

  // Case 2: Use OptionsCombobox for static options (unified approach)
  if (inputStrategy === "static_options") {
    return (
      <OptionsCombobox
        attribute={condition.attribute}
        value={condition.value as string | string[]}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder={getSelectionPlaceholder(isMultiple)}
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
        multiple={isMultiple}
        staticOptions={options}
        currentFilters={currentFilters}
        uniqueFilters={uniqueFilters}
      />
    );
  }

  // Case 3: Use UnifiedSmartDateInput for date types
  if (inputStrategy === "date_input") {
    return (
      <UnifiedSmartDateInput
        variant="default"
        value={condition.value as string | [string, string] | null}
        onChange={value => onChange({ ...condition, value })}
        forceRangeMode={isRange}
        placeholder={getPlaceholderForType(type)}
        className="flex-1"
      />
    );
  }

  // Case 4: For other attribute types, use standard input
  return (
    <Input
      value={condition.value as string}
      onChange={e => onChange({ ...condition, value: e.target.value })}
      placeholder={getPlaceholderForType(type)}
      className="flex-1"
      type={getInputTypeForAttributeType(type)}
    />
  );
}

// These functions are now imported from the factory
// Keeping them here for backward compatibility with any direct imports
// TODO: Remove these once all imports are updated to use the factory directly
export {
  getInputTypeForAttributeType,
  getPlaceholderForType,
} from "@lens2/filters/logic/value-input-factory";
