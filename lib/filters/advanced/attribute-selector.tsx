import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import React from "react";

interface AttributeSelectorProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * AttributeSelector - A specialized component for selecting a single attribute
 *
 * This wraps the generic Combobox component but enforces single selection
 * and provides a cleaner API specifically for attribute selection.
 */
export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select attribute",
  searchPlaceholder = "Search attributes...",
  emptyText = "No attribute found.",
  className,
  disabled = false,
}) => {
  // Handle the value change, ensuring we always work with single values
  const handleChange = (newValue: string | string[]) => {
    // Since this is for attribute selection, we only expect single values
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
