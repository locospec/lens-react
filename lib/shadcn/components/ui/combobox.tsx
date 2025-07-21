"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@lens2/shadcn/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  multiple = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize value to array for easier handling
  const selectedValues = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          <span className="flex-1 truncate text-left">
            {selectedValues.length === 0
              ? placeholder
              : multiple
                ? selectedValues.length === 1
                  ? options.find(opt => opt.value === selectedValues[0])?.label
                  : `${selectedValues.length} selected`
                : options.find(opt => opt.value === selectedValues[0])?.label}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={currentValue => {
                    if (multiple) {
                      const newValues = selectedValues.includes(currentValue)
                        ? selectedValues.filter(v => v !== currentValue)
                        : [...selectedValues, currentValue];
                      onValueChange?.(newValues);
                    } else {
                      onValueChange?.(currentValue);
                      setOpen(false);
                    }
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
