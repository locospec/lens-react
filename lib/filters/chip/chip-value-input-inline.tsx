import { UnifiedSmartDateInput } from "@lens2/filters/components/unified-smart-date-input";
import { operatorExpectsRange } from "@lens2/filters/logic/filter-operators-config";
import { isDateType } from "@lens2/filters/logic/value-input-factory";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Input } from "@lens2/shadcn/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import * as React from "react";
import { ChipOptionsSelector } from "./chip-options-selector";
import { ChipValueInputProps } from "./types";

/**
 * Inline version of ChipValueInput that uses popovers for options selection
 * This is used in ChipCondition where space is constrained
 */
export function ChipValueInputInline({
  attribute,
  value,
  onChange,
  operator = attribute.defaultOperator,
  className,
  isEditing = false,
  onEditingChange,
}: ChipValueInputProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const options = attribute.options || [];
  const optionsAggregator = attribute?.optionsAggregator;
  const hasOptions = options.length > 0 || !!optionsAggregator;
  const isDateAttribute = isDateType(attribute.type);

  // Determine if multiple selection based on operator
  const isMultiple = operator === "is_any_of" || operator === "is_none_of";
  const isRange = operatorExpectsRange(operator);

  // Handle value change from selector
  const handleValueChange = (newValue: unknown) => {
    onChange(newValue);
    if (!isMultiple) {
      setPopoverOpen(false);
      onEditingChange?.(false);
    }
  };

  // For date attributes, use UnifiedSmartDateInput
  if (isDateAttribute) {
    return (
      <UnifiedSmartDateInput
        variant="chip"
        value={value as string | [string, string] | null}
        onChange={onChange}
        forceRangeMode={isRange}
        placeholder={`Select ${attribute.label.toLowerCase()}`}
        className={className}
      />
    );
  }

  // For non-options attributes (text input)
  if (!hasOptions) {
    if (!isEditing) {
      const displayValue = (() => {
        if (value === null || value === undefined) return "empty";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (value instanceof Date) return value.toLocaleDateString();
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(", ") : "empty";
        }
        return String(value);
      })();

      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-auto p-0 px-1", className)}
          onClick={() => onEditingChange?.(true)}
        >
          {displayValue}
        </Button>
      );
    }

    return (
      <Input
        type="text"
        value={value as string}
        onChange={e => onChange(e.target.value)}
        placeholder={`Enter ${attribute.label.toLowerCase()}`}
        className={cn("h-6", className)}
        autoFocus
        onBlur={() => onEditingChange?.(false)}
      />
    );
  }

  // For options-based attributes, use ChipOptionsSelector in a popover
  if (!popoverOpen) {
    // When popover is closed, show ChipOptionsSelector in display mode
    return (
      <Popover open={false}>
        <PopoverTrigger asChild>
          <div
            onClick={() => {
              setPopoverOpen(true);
              onEditingChange?.(true);
            }}
          >
            <ChipOptionsSelector
              attribute={attribute.name}
              value={value as string | string[]}
              onValueChange={handleValueChange}
              multiple={isMultiple}
              staticOptions={options.length > 0 ? options : undefined}
              searchPlaceholder={`Search ${attribute.label.toLowerCase()}...`}
              emptyText={`No ${attribute.label.toLowerCase()} found.`}
              className={className}
              isEditing={false}
              onEditingChange={editing => {
                if (editing) {
                  setPopoverOpen(true);
                  onEditingChange?.(true);
                }
              }}
            />
          </div>
        </PopoverTrigger>
      </Popover>
    );
  }

  // Show popover with options selector in edit mode
  return (
    <Popover
      open={popoverOpen}
      onOpenChange={open => {
        setPopoverOpen(open);
        if (!open) {
          onEditingChange?.(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <div>
          <ChipOptionsSelector
            attribute={attribute.name}
            value={value as string | string[]}
            onValueChange={handleValueChange}
            multiple={isMultiple}
            staticOptions={options.length > 0 ? options : undefined}
            searchPlaceholder={`Search ${attribute.label.toLowerCase()}...`}
            emptyText={`No ${attribute.label.toLowerCase()} found.`}
            className={className}
            isEditing={false}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <ChipOptionsSelector
          attribute={attribute.name}
          value={value as string | string[]}
          onValueChange={handleValueChange}
          multiple={isMultiple}
          staticOptions={options.length > 0 ? options : undefined}
          searchPlaceholder={`Search ${attribute.label.toLowerCase()}...`}
          emptyText={`No ${attribute.label.toLowerCase()} found.`}
          isEditing={true}
        />
      </PopoverContent>
    </Popover>
  );
}
