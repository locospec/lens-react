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
  OwnPropsOfEnum,
  showAsRequired,
} from "@jsonforms/core";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@lens2/shadcn/components/ui/radio-group";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { useFocus } from "../util";

export const ShadcnRadioGroup = (props: ControlProps & OwnPropsOfEnum) => {
  const [focused, onFocus, onBlur] = useFocus();
  const {
    config,
    label,
    required,
    description,
    errors,
    data,
    visible,
    options,
    handleChange,
    path,
    enabled,
  } = props;
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options);
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label
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

      <RadioGroup
        value={props.data ?? ""}
        onValueChange={value => handleChange(path, value)}
        className="flex flex-row space-x-6"
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!enabled}
      >
        {options.map(option => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${option.value}-radio`}
              disabled={!enabled}
            />
            <Label
              htmlFor={`${option.value}-radio`}
              className="cursor-pointer text-sm font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

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
