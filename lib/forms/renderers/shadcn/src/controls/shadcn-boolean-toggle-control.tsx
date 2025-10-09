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
  and,
  ControlProps,
  isBooleanControl,
  isDescriptionHidden,
  optionIs,
  RankedTester,
  rankWith,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { cn } from "@lens2/shadcn/lib/utils";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import { ShadcnToggle } from "../shadcn-controls/shadcn-toggle";

export const ShadcnBooleanToggleControl = ({
  data,
  visible,
  label,
  id,
  enabled,
  uischema,
  schema,
  rootSchema,
  handleChange,
  errors,
  path,
  config,
  description,
}: ControlProps) => {
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    // Toggles do not receive focus until they are used, so
    // we cannot rely on focus as criteria for showing descriptions.
    // So we pass "false" to treat it as unfocused.
    false,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const showTooltip =
    !showDescription &&
    !isDescriptionHidden(
      visible,
      description,
      // Tooltips have their own focus handlers, so we do not need to rely
      // on focus state here. So we pass 'true' to treat it as focused.
      true,
      // We also pass true here for showUnfocusedDescription since it should
      // render regardless of that setting.
      true
    );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  const descriptionIds = [];
  const tooltipId = `${id}-tip`;
  const helpId1 = `${id}-help1`;
  const helpId2 = `${id}-help2`;
  if (showTooltip) {
    descriptionIds.push(tooltipId);
  }
  if (firstFormHelperText) {
    descriptionIds.push(helpId1);
  }
  if (secondFormHelperText) {
    descriptionIds.push(helpId2);
  }
  const ariaDescribedBy = descriptionIds.join(" ");

  if (!visible) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <ShadcnToggle
                id={`${id}-input`}
                isValid={isEmpty(errors)}
                data={data}
                enabled={enabled}
                visible={visible}
                path={path}
                uischema={uischema}
                schema={schema}
                rootSchema={rootSchema}
                handleChange={handleChange}
                errors={errors}
                config={config}
                inputProps={{
                  "aria-describedby": ariaDescribedBy,
                }}
              />
              {label && (
                <Label
                  htmlFor={`${id}-input`}
                  className={cn(
                    "gap-0 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    !isValid && "text-destructive"
                  )}
                >
                  {label}
                </Label>
              )}
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent id={tooltipId}>
              <p>{description}</p>
            </TooltipContent>
          )}
        </Tooltip>
        {firstFormHelperText && (
          <p
            id={helpId1}
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
          <p id={helpId2} className="text-destructive text-sm">
            {secondFormHelperText}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
};

export const shadcnBooleanToggleControlTester: RankedTester = rankWith(
  3,
  and(isBooleanControl, optionIs("toggle", true))
);
export default withJsonFormsControlProps(ShadcnBooleanToggleControl);
