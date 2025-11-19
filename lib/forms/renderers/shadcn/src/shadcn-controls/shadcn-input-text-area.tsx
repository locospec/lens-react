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
import { CellProps, WithClassname } from "@jsonforms/core";
import { Textarea } from "@lens2/shadcn/components/ui/textarea";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import React, { useState } from "react";
import { WithInputProps, useDebouncedChange, useFocus } from "../util";

interface ShadcnTextAreaProps {
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

const eventToValue = (ev: any) =>
  ev.target.value === "" ? undefined : ev.target.value;

export const ShadcnInputTextArea = React.memo(function ShadcnInputTextArea(
  props: CellProps & WithClassname & ShadcnTextAreaProps & WithInputProps
) {
  const [focused, onFocus, onBlur] = useFocus();
  const [showClearButton, setShowClearButton] = useState(false);
  const {
    data,
    config,
    className,
    id,
    enabled,
    uischema,
    isValid,
    path,
    handleChange,
    schema,
    inputProps,
    label,
  } = props;

  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  let mergedInputProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> = {};
  if (appliedUiSchemaOptions.restrict) {
    mergedInputProps.maxLength = maxLength;
  }

  mergedInputProps = merge(mergedInputProps, inputProps);

  if (appliedUiSchemaOptions.trim && maxLength !== undefined) {
    mergedInputProps.maxLength = maxLength;
  }

  const [inputText, onChange, onClear] = useDebouncedChange(
    handleChange,
    "",
    data,
    path,
    eventToValue,
    undefined,
    true,
    focused
  );

  const onPointerEnter = () => setShowClearButton(true);
  const onPointerLeave = () => setShowClearButton(false);

  return (
    <div className="relative">
      <Textarea
        value={inputText}
        onChange={onChange}
        className={cn(className, "h-9 resize-none")}
        onBlur={onBlur}
        onFocus={onFocus}
        id={id}
        disabled={!enabled}
        autoFocus={appliedUiSchemaOptions.focus}
        placeholder={label}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        {...mergedInputProps}
      />
      {/* {showClearButton && enabled && data !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
          onClick={onClear}
          aria-label="Clear input field"
        >
          <X className="h-4 w-4" />
        </Button>
      )} */}
    </div>
  );
});
