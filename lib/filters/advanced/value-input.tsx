import { DynamicOptionsCombobox } from "@lens2/filters/advanced/dynamic-options-combobox";
import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import { Input } from "@lens2/shadcn/components/ui/input";
import type { Attribute, AttributeType } from "@lens2/types/attributes";
import type { Condition } from "@lens2/types/filters";

// Helper function to render value input based on attribute type
export function renderValueInput(
  condition: Condition,
  onChange: (condition: Condition) => void,
  attribute?: Attribute
) {
  if (!attribute) {
    return null;
  }
  const type = attribute.type;
  const options = attribute.options || [];
  const optionsAggregator = attribute?.optionsAggregator;

  // Determine if multiple selection based on operator
  const isMultiple =
    condition.op === "is_any_of" || condition.op === "is_none_of";

  // Case 1: Use DynamicOptionsCombobox for dynamic selection (aggregator-based)
  if (optionsAggregator) {
    return (
      <DynamicOptionsCombobox
        attribute={condition.attribute}
        value={condition.value as string | string[]}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder={isMultiple ? "Select values..." : "Select value"}
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
        multiple={isMultiple}
      />
    );
  }

  // Case 2: Use regular Combobox when static options are present
  if (options.length > 0) {
    return (
      <Combobox
        options={options}
        value={condition.value as string | string[]}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder={isMultiple ? "Select values..." : "Select value"}
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
        multiple={isMultiple}
      />
    );
  }

  // For date types, we could add a date picker here
  // For now, use standard input
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

// Get appropriate input type based on attribute type
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

// Get placeholder text based on attribute type
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
