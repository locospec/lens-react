"use client";

import * as React from "react";

import { cn } from "@lens2/shadcn/lib/utils";
import {
  isCustomPreset,
  isRangePreset,
  type DatePresetValue,
} from "../utils/date-presets";
import { UnifiedDatePicker } from "./unified-date-picker";
import { UnifiedPresetSelector } from "./unified-preset-selector";

export type SmartDateInputVariant = "default" | "chip";

export interface UnifiedSmartDateInputProps {
  variant?: SmartDateInputVariant;
  value?: string | [string, string] | null;
  onChange: (value: string | [string, string] | null) => void;
  forceRangeMode?: boolean; // For range operators like "between"
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function UnifiedSmartDateInput({
  variant = "default",
  value,
  onChange,
  forceRangeMode = false,
  placeholder = "Select date",
  className,
  disabled = false,
}: UnifiedSmartDateInputProps) {
  const [selectedPreset, setSelectedPreset] =
    React.useState<DatePresetValue | null>(null);

  // Initialize preset state from incoming value
  React.useEffect(() => {
    if (typeof value === "string") {
      // Check if value is a preset or a date string
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        // It's likely a preset value
        setSelectedPreset(value as DatePresetValue);
      } else {
        // It's a date string, set to custom_date
        setSelectedPreset("custom_date");
      }
    } else if (Array.isArray(value)) {
      // It's a date range, set to date_range
      setSelectedPreset("date_range");
    } else {
      // No value, reset preset
      setSelectedPreset(null);
    }
  }, [value]);

  // Determine if we should use range mode
  const isRangeMode =
    forceRangeMode || (selectedPreset && isRangePreset(selectedPreset));

  // Should show the date picker on the right?
  const showDatePicker = selectedPreset && isCustomPreset(selectedPreset);

  // Handle preset selection
  const handlePresetSelect = React.useCallback(
    (preset: DatePresetValue) => {
      setSelectedPreset(preset);

      if (isCustomPreset(preset)) {
        // Don't call onChange for custom presets - wait for actual date selection
        // The date picker will handle the onChange when user selects a date
      } else {
        // Store preset value directly (don't resolve to dates)
        onChange(preset);
      }
    },
    [onChange]
  );

  // Handle custom date picker selection
  const handleCustomDateChange = React.useCallback(
    (dateValue: string | [string, string] | null) => {
      onChange(dateValue);
    },
    [onChange]
  );

  // Display preset value - show selected preset or resolved value
  const presetDisplayValue = React.useMemo(() => {
    if (selectedPreset) {
      if (isCustomPreset(selectedPreset)) {
        return selectedPreset === "custom_date" ? "Custom date" : "Date range";
      }
      // For non-custom presets, show the preset name
      const presetDef = selectedPreset;
      return (
        presetDef.charAt(0).toUpperCase() +
        presetDef.slice(1).replace(/_/g, " ")
      );
    }
    return "Select preset";
  }, [selectedPreset]);

  // Variant-specific styling and gap
  const containerClasses =
    variant === "chip" ? "flex items-center gap-1" : "flex items-center gap-2";

  const presetSelectorClasses =
    variant === "chip" ? "flex-shrink-0" : "min-w-[140px] flex-shrink-0";

  const datePickerClasses =
    variant === "chip" ? "flex-1" : "min-w-[200px] flex-1";

  return (
    <div className={cn(containerClasses, className)}>
      {/* Left side: Preset selector - always shown */}
      <UnifiedPresetSelector
        variant={variant}
        value={selectedPreset}
        onChange={handlePresetSelect}
        placeholder={presetDisplayValue}
        disabled={disabled}
        className={presetSelectorClasses}
      />

      {/* Right side: Date picker - only shown for custom presets */}
      {showDatePicker && (
        <UnifiedDatePicker
          variant={variant}
          mode={isRangeMode ? "range" : "single"}
          value={value}
          onChange={handleCustomDateChange}
          placeholder={placeholder}
          disabled={disabled}
          className={datePickerClasses}
        />
      )}
    </div>
  );
}
