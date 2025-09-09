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
  defaultTimeFormat,
  isDescriptionHidden,
  isTimeControl,
  RankedTester,
  rankWith,
  showAsRequired,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { Clock } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  createOnBlurHandler,
  createOnChangeHandler,
  getData,
  useFocus,
} from "../util";

export const ShadcnTimeControl = (props: ControlProps) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    id,
    description,
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
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const isValid = errors.length === 0;

  const [key, setKey] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const format = appliedUiSchemaOptions.timeFormat ?? "HH:mm";
  const saveFormat = appliedUiSchemaOptions.timeSaveFormat ?? defaultTimeFormat;

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

  // Convert time value to display format
  const displayValue = value
    ? new Date(`2000-01-01T${value}`).toLocaleTimeString("en-US", {
        hour12: !!appliedUiSchemaOptions.ampm,
        hour: "2-digit",
        minute: "2-digit",
        hour12: !!appliedUiSchemaOptions.ampm,
      })
    : "";

  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={id + "-input"}
          className={cn(
            "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            !isValid && "text-destructive"
          )}
        >
          {label}
          {showAsRequired(
            required,
            appliedUiSchemaOptions.hideRequiredAsterisk
          ) && <span className="text-destructive ml-1">*</span>}
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
            <Clock className="mr-2 h-4 w-4" />
            {value ? displayValue : <span>Pick a time</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Input
              type="time"
              value={value || ""}
              onChange={e => {
                onChange(e.target.value);
                setOpen(false);
              }}
              disabled={!enabled}
              className={cn("w-full", !isValid && "border-destructive")}
              autoFocus
            />
          </div>
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

export const shadcnTimeControlTester: RankedTester = rankWith(4, isTimeControl);

export default withJsonFormsControlProps(ShadcnTimeControl);
