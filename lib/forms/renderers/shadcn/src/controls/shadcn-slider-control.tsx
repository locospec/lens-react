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
  isDescriptionHidden,
  isRangeControl,
  RankedTester,
  rankWith,
  showAsRequired,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Label } from "@lens2/shadcn/components/ui/label";
import { Slider } from "@lens2/shadcn/components/ui/slider";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { useCallback } from "react";
import { useFocus } from "../util";

export const ShadcnSliderControl = (props: ControlProps) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    id,
    data,
    description,
    enabled,
    errors,
    label,
    schema,
    handleChange,
    visible,
    path,
    required,
    config,
  } = props;
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const onChange = useCallback(
    (value: number[]) => handleChange(path, Number(value[0])),
    [path, handleChange]
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={id}
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
      <div className="flex items-center space-x-2">
        <span className="text-muted-foreground min-w-[2rem] text-sm">
          {schema.minimum}
        </span>
        <Slider
          value={[Number(data || schema.default)]}
          onValueChange={onChange}
          max={schema.maximum}
          min={schema.minimum}
          step={schema.multipleOf || 1}
          disabled={!enabled}
          className="flex-1"
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <span className="text-muted-foreground min-w-[2rem] text-right text-sm">
          {schema.maximum}
        </span>
      </div>
      {(!isValid ? errors : showDescription ? description : null) && (
        <p
          className={cn(
            "text-sm",
            !isValid ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {!isValid ? errors : showDescription ? description : null}
        </p>
      )}
    </div>
  );
};

export const shadcnSliderControlTester: RankedTester = rankWith(
  4,
  isRangeControl
);

export default withJsonFormsControlProps(ShadcnSliderControl);
