// @ts-nocheck
/*
  The MIT License

  Copyright (c) 2017-2020 EclipseSource Munich
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
  EnumCellProps,
  EnumOption,
  isDescriptionHidden,
  showAsRequired,
  WithClassname,
} from "@jsonforms/core";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@lens2/shadcn/components/ui/command";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { useFocus } from "../util/focus";

export interface WithOptionLabel {
  getOptionLabel?(option: EnumOption): string;
  renderOption?(
    props: React.HTMLAttributes<HTMLDivElement>,
    option: EnumOption
  ): ReactNode;
  filterOptions?(options: EnumOption[], searchValue: string): EnumOption[];
}

export const ShadcnAutocomplete = (
  props: ControlProps & EnumCellProps & WithClassname & WithOptionLabel
) => {
  const {
    description,
    errors,
    visible,
    required,
    label,
    data,
    className,
    id,
    enabled,
    uischema,
    path,
    handleChange,
    options,
    config,
    getOptionLabel,
    renderOption,
    filterOptions,
    isValid,
  } = props;

  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [open, setOpen] = useState(false);
  const [focused, onFocus, onBlur] = useFocus();

  const findOption = options?.find(o => o.value === data) ?? null;

  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  const firstFormHelperText = showDescription
    ? description
    : !isValid
      ? errors
      : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  if (!visible) {
    return null;
  }

  const filteredOptions = filterOptions
    ? filterOptions(options ?? [], "")
    : options;

  const handleSelect = (option: EnumOption) => {
    handleChange(path, option.value);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label
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
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !findOption && "text-muted-foreground",
              className
            )}
            disabled={!enabled}
            id={id}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {findOption
              ? getOptionLabel
                ? getOptionLabel(findOption)
                : findOption.label
              : `Select ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions?.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        findOption?.value === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {renderOption
                      ? renderOption({}, option)
                      : getOptionLabel
                        ? getOptionLabel(option)
                        : option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
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
