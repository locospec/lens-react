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
  showAsRequired,
  WithClassname,
} from "@jsonforms/core";
import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { Badge } from "@lens2/shadcn/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@lens2/shadcn/components/ui/command";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Label } from "@lens2/shadcn/components/ui/label";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOption } from "../../../shared/use-option";
import { usePrefill } from "../../../shared/use-prefill";
import { useFocus } from "../util";

export interface ApiAutocompleteOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

export interface ApiAutocompleteConfig {
  relatedModelName?: string;
  valueField?: string;
  labelField?: string;
  placeholder?: string;
  noOptionsText?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  perPage?: number;
  prefillMapping?: Record<string, Record<string, string>>;
  minSearchLength?: number;
  debounceMs?: number;
  dependencies?: string[]; // Array of field names this field depends on
}

export const ShadcnApiAutocomplete = (props: ControlProps & WithClassname) => {
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
    className,
  } = props;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const previousDataRef = useRef(data);

  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = useMemo(
    () => merge({}, config, uischema.options) as ApiAutocompleteConfig,
    [config, uischema.options]
  );

  const {
    relatedModelName,
    valueField = "uuid",
    labelField = "name",
    placeholder = "Type to search...",
    noOptionsText = "No options found",
    searchPlaceholder = "Search...",
    multiple = false,
    perPage = 20,
    prefillMapping,
    minSearchLength = 1,
    debounceMs = 300,
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

  // Handle input value change with debouncing
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      setIsUserTyping(true);

      // Always update the form data with whatever the user types
      // This allows free-form text input
      handleChange(path, value);

      // Only search if input meets minimum length requirement
      if (value.length >= minSearchLength) {
        onSearchChange(value);
      } else if (value.length === 0) {
        // Clear search when input is empty
        onSearchChange("");
      }

      // Reset typing state after a delay
      setTimeout(() => {
        setIsUserTyping(false);
      }, 1000);
    },
    [onSearchChange, minSearchLength, handleChange, path]
  );

  // Initialize input value when component mounts or data changes from external source
  useEffect(() => {
    // Only update if data actually changed and user is not typing
    if (data !== previousDataRef.current && !isUserTyping && !open) {
      previousDataRef.current = data;

      if (!multiple && data) {
        // Data is always the label/text value, show it as is
        setInputValue(String(data));
      } else if (!multiple && !data) {
        setInputValue("");
      }
    }
  }, [data, multiple, isUserTyping, open]);

  // Handle option selection
  const handleOptionSelect = useCallback(
    (option: ApiAutocompleteOption) => {
      const value = String(option.value);

      if (multiple) {
        const currentValues = Array.isArray(data) ? data : [];
        const newValues = currentValues.includes(option.label)
          ? currentValues.filter(v => v !== option.label)
          : [...currentValues, option.label];
        handleChange(path, newValues);
        // Keep input focused for multiple selection
        setInputValue("");
        setIsUserTyping(false);
      } else {
        // For single selection, store the label (not UUID)
        handleChange(path, option.label);
        setInputValue(option.label);
        setIsUserTyping(false);
        setOpen(false);
      }
    },
    [multiple, data, handleChange, path]
  );

  // Handle removing selected value (for multiple mode)
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

  // Handle popover open/close
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        onFocus();
      } else {
        onBlur();
        // Don't reset input value when closing - let user continue typing
      }
    },
    [onFocus, onBlur]
  );

  // Get selected options for display
  const selectedOptions = useMemo(() => {
    if (multiple) {
      const selectedValues = Array.isArray(data) ? data : [];
      const filtered = options.filter(option =>
        selectedValues.includes(String(option.label))
      );
      return filtered;
    } else {
      const selectedValue = String(data);
      const filtered = options.filter(
        option => String(option.label) === selectedValue
      );
      return filtered;
    }
  }, [options, data, multiple]);

  // Filter options based on input value (client-side filtering for better UX)
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < minSearchLength) {
      return options;
    }

    return options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue, minSearchLength]);

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

      <div className="relative">
        <Input
          id={id + "-input"}
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => {
            setOpen(true);
            onFocus();
          }}
          onBlur={() => {
            // Delay closing to allow option selection
            setTimeout(() => {
              setOpen(false);
              onBlur();
            }, 200);
          }}
          onKeyDown={e => {
            // Reopen dropdown when user starts typing
            if (e.key !== "Escape" && e.key !== "Tab") {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full pr-8",
            !isValid && "border-destructive",
            !enabled && "cursor-not-allowed opacity-50"
          )}
          disabled={!enabled}
          autoComplete="off"
        />
        <ChevronsUpDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />

        {open && (
          <div
            className="bg-popover border-border absolute z-50 mt-1 w-full rounded-md border shadow-md"
            onMouseDown={e => e.preventDefault()} // Prevent input blur when clicking dropdown
          >
            <Command>
              <CommandList
                ref={listRef}
                onScroll={onScroll}
                className="max-h-60"
              >
                <CommandEmpty>
                  {isLoading ? "Loading..." : noOptionsText}
                </CommandEmpty>
                <CommandGroup>
                  {filteredOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={String(option.value)}
                      onSelect={() => {
                        handleOptionSelect(option);
                      }}
                      className="hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2"
                      onMouseDown={e => {
                        e.preventDefault();
                        handleOptionSelect(option);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValues.includes(String(option.value))
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}

                  {/* Load more button for pagination */}
                  {hasNextPage && (
                    <CommandItem
                      onSelect={() => fetchNextPage()}
                      disabled={isFetching}
                      className="hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2"
                      onMouseDown={e => {
                        e.preventDefault();
                        fetchNextPage();
                      }}
                    >
                      {isFetching ? "Loading more..." : "Load more..."}
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        {/* Show selected values as badges for multiple selection */}
        {multiple && selectedOptions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedOptions.map(option => (
              <Badge key={option.value} variant="secondary" className="mr-1">
                {option.label}
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
            ))}
          </div>
        )}
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
