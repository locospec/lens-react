// @ts-nocheck
/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
  ControlProps,
  isDateTimeControl,
  isDescriptionHidden,
  RankedTester,
  rankWith,
  showAsRequired,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Calendar } from "@lens2/shadcn/components/ui/calendar";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import merge from "lodash/merge";
import { CalendarIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { createOnBlurHandler, useFocus } from "../util";

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const ShadcnDateTimeControl = (props: ControlProps) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    description,
    id,
    errors,
    label,
    uischema,
    visible,
    enabled,
    required,
    path,
    handleChange,
    data,
    config,
  } = props;
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const [key, setKey] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const format = appliedUiSchemaOptions.dateTimeFormat ?? "YYYY-MM-DD HH:mm";
  const saveFormat = "YYYY-MM-DDTHH:mm:ss[Z]"; // ISO format with UTC

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  const updateChild = useCallback(() => setKey(key => key + 1), []);

  // Helper function to convert UTC value to local Date for display
  const getDisplayValue = (val: any) => {
    if (!val) return null;

    let dayjsValue;
    if (val instanceof Date) {
      dayjsValue = dayjs(val);
    } else if (typeof val === "string") {
      // Try to parse as UTC first, then as local
      dayjsValue = dayjs.utc(val).isValid() ? dayjs.utc(val) : dayjs(val);
    } else {
      dayjsValue = dayjs(val);
    }

    if (!dayjsValue.isValid()) return null;

    // Convert UTC to local timezone for display
    return dayjsValue.local().toDate();
  };

  const displayValue = getDisplayValue(data);

  // Custom onChange handler for proper UTC conversion
  const onChange = useMemo(
    () => (value: dayjs.Dayjs) => {
      if (!value || !value.isValid()) {
        handleChange(path, undefined);
      } else {
        // Convert local time to UTC and format as ISO string
        const utcValue = value.utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        handleChange(path, utcValue);
      }
    },
    [path, handleChange]
  );

  const onBlurHandler = useMemo(
    () =>
      createOnBlurHandler(
        path,
        handleChange,
        format,
        saveFormat,
        updateChild,
        onBlur
      ),
    [path, handleChange, format, saveFormat, updateChild]
  );

  const onTimeBlurHandler = useMemo(
    () => (e: React.FocusEvent<HTMLInputElement>) => {
      if (displayValue) {
        const timeValue = e.target.value;
        if (timeValue) {
          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (timeRegex.test(timeValue)) {
            // Create local date-time string from display value and new time
            const year = displayValue.getFullYear();
            const month = String(displayValue.getMonth() + 1).padStart(2, "0");
            const day = String(displayValue.getDate()).padStart(2, "0");
            const localDateTime = `${year}-${month}-${day}T${timeValue}`;

            // Convert local time to UTC using dayjs
            const localDayjs = dayjs(localDateTime);
            if (localDayjs.isValid()) {
              onChange(localDayjs);
            }
          }
        }
      }
      onBlur();
    },
    [displayValue, onChange, onBlur]
  );

  // Handle pasting a date in DD/MM/YYYY format anywhere within the control
  const onPasteHandler = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData("text").trim();
      const match = /^(\d{1,2})[/:\-](\d{1,2})[/:\-](\d{4})$/.exec(text);
      if (!match) {
        return;
      }

      e.preventDefault();

      const day = match[1].padStart(2, "0");
      const month = match[2].padStart(2, "0");
      const year = match[3];

      const time = displayValue
        ? displayValue.toTimeString().split(" ")[0]
        : "00:00";

      const localDateTime = `${year}-${month}-${day}T${time}`;
      const localDayjs = dayjs(localDateTime);

      if (localDayjs.isValid()) {
        onChange(localDayjs);
        setOpen(false);
      }
    },
    [displayValue, onChange]
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-2" onPaste={onPasteHandler}>
      {label && (
        <Label
          htmlFor={id + "-input"}
          className={cn(
            "gap-0 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            !isValid && "text-destructive"
          )}
        >
          {label}
          {showAsRequired(
            required,
            appliedUiSchemaOptions.hideRequiredAsterisk
          ) && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !displayValue && "text-muted-foreground",
                !isValid && "border-destructive"
              )}
              disabled={!enabled}
              onFocus={onFocus}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayValue ? (
                displayValue.toLocaleDateString()
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={displayValue || undefined}
              onSelect={date => {
                if (date) {
                  const time = displayValue
                    ? displayValue.toTimeString().split(" ")[0]
                    : "00:00";
                  // Create local date-time string
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const localDateTime = `${year}-${month}-${day}T${time}`;

                  // Convert local time to UTC using dayjs
                  const localDayjs = dayjs(localDateTime);
                  if (localDayjs.isValid()) {
                    onChange(localDayjs);
                  }
                  setOpen(false);
                }
              }}
              disabled={date => !enabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={displayValue ? displayValue.toTimeString().split(" ")[0] : ""}
          onChange={e => {
            if (displayValue && e.target.value) {
              // Create local date-time string from display value and new time
              const year = displayValue.getFullYear();
              const month = String(displayValue.getMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(displayValue.getDate()).padStart(2, "0");
              const localDateTime = `${year}-${month}-${day}T${e.target.value}`;

              // Convert local time to UTC using dayjs
              const localDayjs = dayjs(localDateTime);
              if (localDayjs.isValid()) {
                onChange(localDayjs);
              }
            }
          }}
          onBlur={onTimeBlurHandler}
          disabled={!enabled}
          className={cn("w-32", !isValid && "border-destructive")}
        />
      </div>
      {firstFormHelperText && (
        <p
          className={cn(
            "text-sm",
            !isValid && !showDescription
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {firstFormHelperText}
        </p>
      )}
      {secondFormHelperText && (
        <p className="text-destructive text-sm">{secondFormHelperText}</p>
      )}
    </div>
  );
};

export const shadcnDateTimeControlTester: RankedTester = rankWith(
  4,
  isDateTimeControl
);

export default withJsonFormsControlProps(ShadcnDateTimeControl);
