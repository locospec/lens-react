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
  and,
  ControlProps,
  isDescriptionHidden,
  RankedTester,
  rankWith,
  schemaMatches,
  showAsRequired,
  uiTypeIs,
} from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { OptionsSelector } from "@lens2/filters/components/ui/options-selector";
import { Badge } from "@lens2/shadcn/components/ui/badge";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { ChevronsUpDown, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOption } from "../../../shared/use-option";
import { usePrefill } from "../../../shared/use-prefill";
import { useFocus } from "../util";

export interface ApiSearchSelectOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export interface ApiSearchSelectConfig {
  relatedModelName?: string;
  valueField?: string;
  labelField?: string;
  placeholder?: string;
  noOptionsText?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  perPage?: number;
  prefillMapping?: Record<string, Record<string, string>>;
}

export const ShadcnDynamicSelectControl = (props: ControlProps) => {
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
    schema,
  } = props;

  const [open, setOpen] = useState(false);
  const [hydratedOptions, setHydratedOptions] = useState(
    new Map<string, string>()
  );

  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = useMemo(
    () => merge({}, config, uischema.options) as ApiSearchSelectConfig,
    [config, uischema.options]
  );

  const {
    relatedModelName,
    valueField = "uuid",
    labelField = "name",
    placeholder = "Select an option...",
    noOptionsText = "No options found",
    searchPlaceholder = "Search...",
    multiple = false,
    perPage = 10,
    prefillMapping,
  } = appliedUiSchemaOptions;

  // Use our custom useOption hook
  const useOptionParams = useMemo(
    () => ({
      relatedModelName: relatedModelName || "",
      valueField,
      labelField,
      perPage,
      enabled: !!relatedModelName,
      prefilledValue: data, // Pass the current data value as prefilled value
      dependencies: appliedUiSchemaOptions.dependencies, // Pass dependencies for filtering
    }),
    [
      relatedModelName,
      valueField,
      labelField,
      perPage,
      data,
      appliedUiSchemaOptions.dependencies,
    ]
  );

  const {
    options,
    searchQuery,
    onSearchChange,
    onSelect,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    listRef,
    onScroll,
    refetch,
  } = useOption(useOptionParams);

  // Get field refetch functions from context
  const { registerFieldRefetch, unregisterFieldRefetch, triggerFieldRefetch } =
    useLensFormContext();

  // Register this field's refetch function
  useEffect(() => {
    if (relatedModelName) {
      registerFieldRefetch(path, refetch);
      return () => unregisterFieldRefetch(path);
    }
  }, [
    path,
    refetch,
    relatedModelName,
    registerFieldRefetch,
    unregisterFieldRefetch,
  ]);

  // Handle prefill functionality
  const {
    selectedOptionData,
    fieldPrefillMapping,
    fullSelectedData,
    isLoadingFullData,
  } = usePrefill({
    selectedValue: data,
    prefillMapping,
    fieldPath: path,
    onFieldUpdate: handleChange,
    options,
    onTriggerFieldRefetch: triggerFieldRefetch,
  });

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

  // Get selected values
  const selectedValues = useMemo(() => {
    if (multiple) {
      const result = Array.isArray(data) ? data.map(String) : [];
      return result;
    } else {
      const result = data ? [String(data)] : [];
      return result;
    }
  }, [data, multiple]);

  // Handle option selection
  const handleOptionSelect = useCallback(
    (value: string) => {
      if (multiple) {
        const currentValues = Array.isArray(data) ? data : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        handleChange(path, newValues);
      } else {
        handleChange(path, value);
        setOpen(false);
      }
    },
    [multiple, data, handleChange, path]
  );

  const handleValueChange = useCallback(
    (value: string) => {
      if (multiple) {
        const currentValues = Array.isArray(data) ? data : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        handleChange(path, newValues.length > 0 ? newValues : undefined);
      } else {
        handleChange(path, value || undefined);
        setOpen(false);
      }
    },
    [path, handleChange, multiple, data]
  );

  const handleRemoveValue = useCallback(
    (valueToRemove: string) => {
      if (multiple) {
        const currentValues = Array.isArray(data) ? data : [];
        const newValues = currentValues.filter(v => v !== valueToRemove);
        handleChange(path, newValues.length > 0 ? newValues : undefined);
      }
    },
    [path, handleChange, multiple, data]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        onFocus();
      } else {
        onBlur();
      }
    },
    [onFocus, onBlur]
  );

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const selectedValues = Array.isArray(data) ? data : [];
      const filtered = options.filter(option =>
        selectedValues.includes(String(option.value))
      );
      return filtered;
    } else {
      const selectedValue = String(data);
      const filtered = options.filter(
        option => String(option.value) === selectedValue
      );
      return filtered;
    }
  }, [options, data, multiple]);

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
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !isValid && "border-destructive",
              !selectedOptions.length && "text-muted-foreground"
            )}
            disabled={!enabled}
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map(option => {
                  return multiple ? (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="mr-1 mb-1"
                    >
                      <button
                        className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            handleRemoveValue(String(option.value));
                          }
                        }}
                        onMouseDown={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => handleRemoveValue(String(option.value))}
                      >
                        <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                      </button>
                    </Badge>
                  ) : (
                    <>{option.label}</>
                  );
                })
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <OptionsSelector
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            options={options}
            selectedValues={selectedValues}
            hydratedOptions={hydratedOptions}
            onSelect={handleOptionSelect}
            multiple={multiple}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            listRef={listRef}
            onScroll={onScroll}
            emptyText={noOptionsText}
            className="w-full"
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

// Tester function - detects controls with relatedModelName in schema
export const shadcnDynamicSelectControlTester: RankedTester = rankWith(
  5,
  and(
    uiTypeIs("Control"),
    schemaMatches(schema =>
      Object.prototype.hasOwnProperty.call(schema, "relatedModelName")
    )
  )
);

export default withJsonFormsControlProps(ShadcnDynamicSelectControl);
