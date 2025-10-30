"use client";

import { Check, ChevronsUpDown } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lens2/shadcn/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import { type DatePresetValue, getDatePreset } from "../utils/date-presets";

export type PresetSelectorVariant = "default" | "chip";

export interface UnifiedPresetSelectorProps {
  variant?: PresetSelectorVariant;
  value?: DatePresetValue | null;
  onChange: (value: DatePresetValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function UnifiedPresetSelector({
  variant = "default",
  value,
  onChange,
  placeholder = "Select preset",
  disabled = false,
  className,
}: UnifiedPresetSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const displayValue = React.useMemo(() => {
    if (!value) return placeholder;

    const preset = getDatePreset(value);
    return preset ? preset.label : placeholder;
  }, [value, placeholder]);

  // Render chip variant with DropdownMenu
  if (variant === "chip") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-foreground h-auto p-0 px-1",
              className
            )}
          >
            {displayValue}
            <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {/* Quick presets */}
          <DropdownMenuItem
            onClick={() => onChange("today")}
            className={cn("cursor-pointer", value === "today" && "bg-accent")}
          >
            Today
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("yesterday")}
            className={cn(
              "cursor-pointer",
              value === "yesterday" && "bg-accent"
            )}
          >
            Yesterday
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("tomorrow")}
            className={cn(
              "cursor-pointer",
              value === "tomorrow" && "bg-accent"
            )}
          >
            Tomorrow
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Time periods */}
          <DropdownMenuItem
            onClick={() => onChange("next_7_days")}
            className={cn(
              "cursor-pointer",
              value === "next_7_days" && "bg-accent"
            )}
          >
            Next 7 days
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("last_7_days")}
            className={cn(
              "cursor-pointer",
              value === "last_7_days" && "bg-accent"
            )}
          >
            Last 7 days
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("this_week")}
            className={cn(
              "cursor-pointer",
              value === "this_week" && "bg-accent"
            )}
          >
            This week
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("next_week")}
            className={cn(
              "cursor-pointer",
              value === "next_week" && "bg-accent"
            )}
          >
            Next week
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("last_week")}
            className={cn(
              "cursor-pointer",
              value === "last_week" && "bg-accent"
            )}
          >
            Last week
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Monthly */}
          <DropdownMenuItem
            onClick={() => onChange("last_month")}
            className={cn(
              "cursor-pointer",
              value === "last_month" && "bg-accent"
            )}
          >
            Last month
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("this_month")}
            className={cn(
              "cursor-pointer",
              value === "this_month" && "bg-accent"
            )}
          >
            This month
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("next_month")}
            className={cn(
              "cursor-pointer",
              value === "next_month" && "bg-accent"
            )}
          >
            Next month
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Quarterly */}
          <DropdownMenuItem
            onClick={() => onChange("last_quarter")}
            className={cn(
              "cursor-pointer",
              value === "last_quarter" && "bg-accent"
            )}
          >
            Last quarter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("this_quarter")}
            className={cn(
              "cursor-pointer",
              value === "this_quarter" && "bg-accent"
            )}
          >
            This quarter
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("next_quarter")}
            className={cn(
              "cursor-pointer",
              value === "next_quarter" && "bg-accent"
            )}
          >
            Next quarter
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Special */}
          <DropdownMenuItem
            onClick={() => onChange("today_and_earlier")}
            className={cn(
              "cursor-pointer",
              value === "today_and_earlier" && "bg-accent"
            )}
          >
            Today & Earlier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("overdue")}
            className={cn("cursor-pointer", value === "overdue" && "bg-accent")}
          >
            Overdue
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("later_than_today")}
            className={cn(
              "cursor-pointer",
              value === "later_than_today" && "bg-accent"
            )}
          >
            Later than Today
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Custom */}
          <DropdownMenuItem
            onClick={() => onChange("custom_date")}
            className={cn(
              "cursor-pointer font-medium",
              value === "custom_date" && "bg-accent"
            )}
          >
            Custom date
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange("date_range")}
            className={cn(
              "cursor-pointer font-medium",
              value === "date_range" && "bg-accent"
            )}
          >
            Date range
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant with Command component (more searchable)
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue as DatePresetValue);
    setOpen(false);
  };

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
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No preset found.</CommandEmpty>
            <CommandGroup>
              {/* Quick presets */}
              <CommandItem
                value="today"
                onSelect={() => handleSelect("today")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "today" ? "opacity-100" : "opacity-0"
                  )}
                />
                Today
              </CommandItem>
              <CommandItem
                value="yesterday"
                onSelect={() => handleSelect("yesterday")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "yesterday" ? "opacity-100" : "opacity-0"
                  )}
                />
                Yesterday
              </CommandItem>
              <CommandItem
                value="tomorrow"
                onSelect={() => handleSelect("tomorrow")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "tomorrow" ? "opacity-100" : "opacity-0"
                  )}
                />
                Tomorrow
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Time periods">
              <CommandItem
                value="next_7_days"
                onSelect={() => handleSelect("next_7_days")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "next_7_days" ? "opacity-100" : "opacity-0"
                  )}
                />
                Next 7 days
              </CommandItem>
              <CommandItem
                value="last_7_days"
                onSelect={() => handleSelect("last_7_days")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "last_7_days" ? "opacity-100" : "opacity-0"
                  )}
                />
                Last 7 days
              </CommandItem>
              <CommandItem
                value="this_week"
                onSelect={() => handleSelect("this_week")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "this_week" ? "opacity-100" : "opacity-0"
                  )}
                />
                This week
              </CommandItem>
              <CommandItem
                value="next_week"
                onSelect={() => handleSelect("next_week")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "next_week" ? "opacity-100" : "opacity-0"
                  )}
                />
                Next week
              </CommandItem>
              <CommandItem
                value="last_week"
                onSelect={() => handleSelect("last_week")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "last_week" ? "opacity-100" : "opacity-0"
                  )}
                />
                Last week
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Monthly">
              <CommandItem
                value="last_month"
                onSelect={() => handleSelect("last_month")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "last_month" ? "opacity-100" : "opacity-0"
                  )}
                />
                Last month
              </CommandItem>
              <CommandItem
                value="this_month"
                onSelect={() => handleSelect("this_month")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "this_month" ? "opacity-100" : "opacity-0"
                  )}
                />
                This month
              </CommandItem>
              <CommandItem
                value="next_month"
                onSelect={() => handleSelect("next_month")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "next_month" ? "opacity-100" : "opacity-0"
                  )}
                />
                Next month
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Quarterly">
              <CommandItem
                value="last_quarter"
                onSelect={() => handleSelect("last_quarter")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "last_quarter" ? "opacity-100" : "opacity-0"
                  )}
                />
                Last quarter
              </CommandItem>
              <CommandItem
                value="this_quarter"
                onSelect={() => handleSelect("this_quarter")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "this_quarter" ? "opacity-100" : "opacity-0"
                  )}
                />
                This quarter
              </CommandItem>
              <CommandItem
                value="next_quarter"
                onSelect={() => handleSelect("next_quarter")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "next_quarter" ? "opacity-100" : "opacity-0"
                  )}
                />
                Next quarter
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Special">
              <CommandItem
                value="today_and_earlier"
                onSelect={() => handleSelect("today_and_earlier")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "today_and_earlier" ? "opacity-100" : "opacity-0"
                  )}
                />
                Today & Earlier
              </CommandItem>
              <CommandItem
                value="overdue"
                onSelect={() => handleSelect("overdue")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "overdue" ? "opacity-100" : "opacity-0"
                  )}
                />
                Overdue
              </CommandItem>
              <CommandItem
                value="later_than_today"
                onSelect={() => handleSelect("later_than_today")}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "later_than_today" ? "opacity-100" : "opacity-0"
                  )}
                />
                Later than Today
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Custom">
              <CommandItem
                value="custom_date"
                onSelect={() => handleSelect("custom_date")}
                className="cursor-pointer font-medium"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "custom_date" ? "opacity-100" : "opacity-0"
                  )}
                />
                Custom date
              </CommandItem>
              <CommandItem
                value="date_range"
                onSelect={() => handleSelect("date_range")}
                className="cursor-pointer font-medium"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "date_range" ? "opacity-100" : "opacity-0"
                  )}
                />
                Date range
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
