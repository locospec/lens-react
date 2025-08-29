"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@lens2/shadcn/components/ui/button";
import { Calendar } from "@lens2/shadcn/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";

export type DatePickerVariant = "default" | "chip";

export interface UnifiedDatePickerProps {
  variant?: DatePickerVariant;
  mode?: "single" | "range";
  value?: string | [string, string] | null;
  onChange: (value: string | [string, string] | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function UnifiedDatePicker({
  variant = "default",
  mode = "single",
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
}: UnifiedDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Helper to parse date string to Date object in local timezone
  const parseLocalDate = (dateStr: string): Date | null => {
    try {
      if (!dateStr || typeof dateStr !== "string") return null;

      const parts = dateStr.split("-");
      if (parts.length !== 3) return null;

      const [year, month, day] = parts.map(Number);

      // Validate the numbers
      if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
      if (year < 1000 || year > 9999) return null;
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;

      const date = new Date(year, month - 1, day);

      // Check if the date is valid (handles cases like Feb 30)
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    } catch (error) {
      console.warn("Invalid date string:", dateStr, error);
      return null;
    }
  };

  // Convert string dates to Date objects for the calendar
  const calendarValue = React.useMemo(() => {
    if (!value) return undefined;

    if (mode === "range" && Array.isArray(value)) {
      const [start, end] = value;
      return {
        from: start ? parseLocalDate(start) || undefined : undefined,
        to: end ? parseLocalDate(end) || undefined : undefined,
      };
    }

    if (mode === "single" && typeof value === "string") {
      return parseLocalDate(value) || undefined;
    }

    return undefined;
  }, [value, mode]);

  // Helper to format date to YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle calendar selection
  const handleCalendarSelect = React.useCallback(
    (selected: any) => {
      if (mode === "single") {
        if (selected) {
          const dateStr = formatLocalDate(selected);
          onChange(dateStr);
          setOpen(false); // Always close for single date
        } else {
          onChange(null);
        }
      } else if (mode === "range") {
        if (selected?.from && selected?.to) {
          const fromStr = formatLocalDate(selected.from);
          const toStr = formatLocalDate(selected.to);
          onChange([fromStr, toStr]);

          // Only close if dates are different, otherwise keep open
          if (fromStr !== toStr) {
            setOpen(false);
          }
        } else if (!selected) {
          onChange(null);
        }
        // If only from is selected, do nothing - let calendar handle the visual state
      }
    },
    [mode, onChange]
  );

  // Format display text - variant-specific formatting
  const displayText = React.useMemo(() => {
    if (!value) return placeholder;

    if (mode === "range" && Array.isArray(value)) {
      const [start, end] = value;
      const startDate = parseLocalDate(start);
      if (!startDate) return placeholder;

      if (end) {
        const endDate = parseLocalDate(end);
        if (!endDate) return `${startDate.toLocaleDateString()} - Invalid`;

        // Chip variant uses more compact format
        if (variant === "chip") {
          return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } else {
          return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        }
      } else {
        return variant === "chip"
          ? `${startDate.toLocaleDateString()} - ...`
          : `${startDate.toLocaleDateString()} - Select end date`;
      }
    }

    if (mode === "single" && typeof value === "string") {
      const date = parseLocalDate(value);
      if (!date) return placeholder;
      return date.toLocaleDateString();
    }

    return placeholder;
  }, [value, mode, placeholder, variant]);

  // Variant-specific styling
  const buttonVariant = variant === "chip" ? "ghost" : "outline";
  const buttonSize = variant === "chip" ? "sm" : undefined;
  const iconClasses = variant === "chip" ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4";
  const buttonClasses =
    variant === "chip"
      ? "text-muted-foreground hover:text-foreground h-auto justify-start p-0 px-1"
      : "justify-between font-normal";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn(
            buttonClasses,
            !value && "text-muted-foreground",
            className
          )}
          disabled={variant === "default" ? disabled : undefined}
        >
          {displayText}
          <CalendarIcon className={iconClasses} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === "single" ? (
          <Calendar
            mode="single"
            selected={calendarValue as Date | undefined}
            onSelect={handleCalendarSelect}
            captionLayout="dropdown"
            numberOfMonths={1}
            className="rounded-lg border shadow-sm"
            required={false}
            defaultMonth={calendarValue as Date | undefined}
          />
        ) : (
          <Calendar
            mode="range"
            selected={
              calendarValue as
                | { from: Date | undefined; to: Date | undefined }
                | undefined
            }
            onSelect={handleCalendarSelect}
            captionLayout="dropdown"
            numberOfMonths={2}
            className="rounded-lg border shadow-sm"
            required={false}
            defaultMonth={(calendarValue as any)?.from}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
