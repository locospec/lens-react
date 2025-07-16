import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import { Input } from "@lens2/shadcn/components/ui/input";
import type { AttributeType, FilterAttribute } from "@lens2/types/attributes";
import type { Condition } from "@lens2/types/filters";

// Helper function to render value input based on attribute type
export function renderValueInput(
  condition: Condition,
  onChange: (condition: Condition) => void,
  attribute?: FilterAttribute
) {
  const type = attribute?.type || "string";
  const options = attribute?.options || [];

  // For enum types with options, show a combobox
  if (type === "enum" && options.length > 0) {
    const isMultiple =
      condition.op === "is_any_of" || condition.op === "is_none_of";

    if (isMultiple) {
      // For multiple selection, we need a multi-select component
      // For now, use comma-separated values in input
      return (
        <Input
          value={
            Array.isArray(condition.value)
              ? condition.value.join(", ")
              : (condition.value as string)
          }
          onChange={e => {
            const values = e.target.value
              .split(",")
              .map(v => v.trim())
              .filter(Boolean);
            onChange({ ...condition, value: values });
          }}
          placeholder="Enter values separated by commas"
          className="flex-1"
        />
      );
    }

    // Single selection
    return (
      <Combobox
        options={options}
        value={condition.value as string}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder="Select value"
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
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
