import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import type { OperatorDefinition } from "@lens2/types/filters";
import React from "react";

interface OperatorSelectorProps {
  operators: OperatorDefinition[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * OperatorSelector - A specialized component for selecting a single operator
 *
 * This wraps the generic Combobox component but enforces single selection
 * and provides a cleaner API specifically for operator selection.
 */
export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  operators,
  value,
  onValueChange,
  placeholder = "Select operator",
  searchPlaceholder = "Search operators...",
  emptyText = "No operator found.",
  className,
  disabled = false,
}) => {
  // Convert operators to the format expected by Combobox
  const options = operators.map(op => ({
    value: op.value,
    label: op.label,
  }));

  // Handle the value change, ensuring we always work with single values
  const handleChange = (newValue: string | string[]) => {
    // Since this is for operator selection, we only expect single values
    const singleValue = Array.isArray(newValue) ? newValue[0] : newValue;
    if (singleValue && onValueChange) {
      onValueChange(singleValue);
    }
  };

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={handleChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      className={className}
      disabled={disabled}
      multiple={false} // Explicitly set to false for clarity
    />
  );
};
