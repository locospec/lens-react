import { Checkbox } from "@lens2/shadcn/components/ui/checkbox";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@lens2/shadcn/components/ui/command";
import { Label } from "@lens2/shadcn/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@lens2/shadcn/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import type { FC } from "react";

export interface DynamicOption {
  value: string;
  label: string;
  count?: number;
}

export interface DynamicOptionsListProps {
  options: DynamicOption[];
  selectedValues: string[];
  hydratedOptions: Map<string, string>; // Just map ID to label
  multiple: boolean;
  isLoading: boolean;
  isFetching: boolean;
  hasNextPage: boolean;
  emptyText: string;
  onSelect: (value: string) => void;
}

/**
 * A shared component for rendering dynamic options with pagination support.
 * Handles both single and multiple selection modes with appropriate UI controls.
 *
 * Features:
 * - Shows selected items that aren't in the current page
 * - Supports single selection (radio buttons) and multiple selection (checkboxes)
 * - Displays item counts when available
 * - Shows loading states for initial load and pagination
 * - Hydrates selected values that aren't in the current options
 */
export const DynamicOptionsList: FC<DynamicOptionsListProps> = ({
  options,
  selectedValues,
  hydratedOptions,
  multiple,
  isLoading,
  isFetching,
  hasNextPage,
  emptyText,
  onSelect,
}) => {
  if (isLoading && options.length === 0) {
    return (
      <div className="py-6 text-center text-sm">
        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        <p className="text-muted-foreground mt-2">Loading options...</p>
      </div>
    );
  }

  if (options.length === 0 && selectedValues.length === 0) {
    return <CommandEmpty>{emptyText}</CommandEmpty>;
  }

  return (
    <>
      {/* Show selected items that aren't in current options */}
      {selectedValues.length > 0 && multiple && (
        <SelectedItemsSection
          selectedValues={selectedValues}
          options={options}
          hydratedOptions={hydratedOptions}
          onSelect={onSelect}
        />
      )}

      {/* Available options */}
      {options.length > 0 && (
        <CommandGroup>
          {selectedValues.length > 0 &&
            selectedValues.some(
              value => !options.some(opt => opt.value === value)
            ) && (
              <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
                Available
              </div>
            )}

          {multiple ? (
            <MultipleSelectionList
              options={options}
              selectedValues={selectedValues}
              onSelect={onSelect}
            />
          ) : (
            <SingleSelectionList
              options={options}
              selectedValues={selectedValues}
              hydratedOptions={hydratedOptions}
              onSelect={onSelect}
            />
          )}
        </CommandGroup>
      )}

      {isFetching && hasNextPage && (
        <div className="py-2 text-center">
          <Loader2 className="mx-auto h-4 w-4 animate-spin" />
        </div>
      )}
    </>
  );
};

// Sub-component for selected items section
const SelectedItemsSection: FC<{
  selectedValues: string[];
  options: DynamicOption[];
  hydratedOptions: Map<string, string>;
  onSelect: (value: string) => void;
}> = ({ selectedValues, options, hydratedOptions, onSelect }) => {
  // Get selected items that aren't in current page
  const selectedNotInPage = selectedValues.filter(
    value => !options.some(opt => opt.value === value)
  );

  if (selectedNotInPage.length === 0) return null;

  return (
    <CommandGroup>
      <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
        Selected ({selectedNotInPage.length})
      </div>
      {selectedNotInPage.map(value => {
        const label = hydratedOptions.get(value) || value;
        const count = undefined; // We don't store count in cache anymore

        return (
          <OptionItem
            key={`selected-${value}`}
            value={value}
            label={label}
            count={count}
            isSelected={true}
            onSelect={onSelect}
            multiple={true}
          />
        );
      })}
    </CommandGroup>
  );
};

// Sub-component for multiple selection list
const MultipleSelectionList: FC<{
  options: DynamicOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
}> = ({ options, selectedValues, onSelect }) => {
  return (
    <>
      {options.map(option => (
        <OptionItem
          key={option.value}
          value={option.value}
          label={option.label}
          count={option.count}
          isSelected={selectedValues.includes(option.value)}
          onSelect={onSelect}
          multiple={true}
        />
      ))}
    </>
  );
};

// Sub-component for single selection list
const SingleSelectionList: FC<{
  options: DynamicOption[];
  selectedValues: string[];
  hydratedOptions: Map<string, string>;
  onSelect: (value: string) => void;
}> = ({ options, selectedValues, hydratedOptions, onSelect }) => {
  return (
    <RadioGroup
      value={selectedValues[0] ?? ""}
      onValueChange={value => onSelect(value)}
    >
      {/* Show selected hydrated option first if not in current options */}
      {selectedValues.length > 0 &&
        hydratedOptions.size > 0 &&
        !options.some(opt => opt.value === selectedValues[0]) &&
        (() => {
          const label = hydratedOptions.get(selectedValues[0]);
          if (!label) return null;
          return (
            <OptionItem
              key={`selected-${selectedValues[0]}`}
              value={selectedValues[0]}
              label={label}
              count={undefined}
              isSelected={true}
              onSelect={onSelect}
              multiple={false}
            />
          );
        })()}

      {options.map(option => (
        <OptionItem
          key={option.value}
          value={option.value}
          label={option.label}
          count={option.count}
          isSelected={selectedValues.includes(option.value)}
          onSelect={onSelect}
          multiple={false}
        />
      ))}
    </RadioGroup>
  );
};

// Shared option item component
const OptionItem: FC<{
  value: string;
  label: string;
  count?: number;
  isSelected: boolean;
  onSelect: (value: string) => void;
  multiple: boolean;
}> = ({ value, label, count, isSelected, onSelect, multiple }) => {
  const id = multiple ? `checkbox-${value}` : `radio-${value}`;

  return (
    <CommandItem
      value={value}
      onSelect={() => onSelect(value)}
      className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between py-2 data-[selected=true]:bg-transparent"
    >
      <div className="flex flex-1 items-center gap-3">
        <div className="flex items-center">
          {multiple ? (
            <Checkbox
              id={id}
              checked={isSelected}
              onCheckedChange={() => onSelect(value)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <RadioGroupItem
              value={value}
              id={id}
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
        <Label htmlFor={id} className="flex-1 cursor-pointer">
          {label}
        </Label>
      </div>
      {count !== undefined && (
        <span className="text-muted-foreground text-sm">({count})</span>
      )}
    </CommandItem>
  );
};
