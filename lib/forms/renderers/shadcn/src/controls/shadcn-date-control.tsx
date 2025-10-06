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
  defaultDateFormat,
  isDateControl,
  isDescriptionHidden,
  RankedTester,
  rankWith,
  showAsRequired,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Calendar } from "@lens2/shadcn/components/ui/calendar";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { CalendarIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  createOnBlurHandler,
  createOnChangeHandler,
  getData,
  useFocus,
} from "../util";

export const ShadcnDateControl = (props: ControlProps) => {
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

  const format = appliedUiSchemaOptions.dateFormat ?? "YYYY-MM-DD";
  const saveFormat = appliedUiSchemaOptions.dateSaveFormat ?? defaultDateFormat;

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  const updateChild = useCallback(() => setKey(key => key + 1), []);

  const onChange = useMemo(
    () => createOnChangeHandler(path, handleChange, saveFormat),
    [path, handleChange, saveFormat]
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
  const value = getData(data, saveFormat);

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-2">
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              !isValid && "border-destructive"
            )}
            disabled={!enabled}
            id={id + "-input"}
            onFocus={onFocus}
            onBlur={onBlurHandler}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? value : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={date => {
              if (date) {
                onChange(date.toISOString().split("T")[0]);
                setOpen(false);
              }
            }}
            disabled={date => !enabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
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

export const shadcnDateControlTester: RankedTester = rankWith(4, isDateControl);

export default withJsonFormsControlProps(ShadcnDateControl);
