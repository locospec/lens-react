import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { normalizeFilters } from "@lens2/filters/utils/process-filters";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import { Input } from "@lens2/shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lens2/shadcn/components/ui/select";
import { cn } from "@lens2/shadcn/lib/utils";
import type { AttributeType, FilterAttribute } from "@lens2/types/attributes";
import type {
  Condition,
  Filter,
  FilterGroup,
  Operator,
} from "@lens2/types/filters";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  getDefaultOperator,
  getOperatorsForType,
  operatorRequiresValue,
} from "./utils/filter-operators-config";
import { createEmptyCondition } from "./utils/initialize-filter";

interface ConditionRowProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onDelete: () => void;
  canDelete: boolean;
  attributes: Array<{ value: string; label: string }>;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  onChange,
  onDelete,
  canDelete,
  attributes,
}) => {
  const { config } = useLensContext();

  // Get the attribute type for the selected attribute
  const selectedAttribute = config?.attributes?.[condition.attribute] as
    | FilterAttribute
    | undefined;
  const attributeType = (selectedAttribute?.type || "string") as AttributeType;
  const isNullable = selectedAttribute?.isNullable || false;

  // Get operators for the selected attribute type
  const operators = useMemo(() => {
    if (!condition.attribute || !selectedAttribute) return [];
    return getOperatorsForType(attributeType, isNullable);
  }, [condition.attribute, attributeType, selectedAttribute, isNullable]);

  // Check if current operator requires a value
  const needsValue =
    condition.attribute && condition.op
      ? operatorRequiresValue(attributeType, condition.op)
      : false;

  // Handle attribute change
  const handleAttributeChange = (value: string) => {
    const newAttribute = config?.attributes?.[value] as
      | FilterAttribute
      | undefined;
    const newType = (newAttribute?.type || "string") as AttributeType;
    const defaultOp = getDefaultOperator(newType);

    onChange({
      ...condition,
      attribute: value,
      op: defaultOp as Operator,
      value: "", // Reset value when attribute changes
    });
  };

  return (
    <div className="bg-muted/30 flex items-center gap-2 rounded-md border p-3">
      <Combobox
        options={attributes}
        value={condition.attribute}
        onValueChange={handleAttributeChange}
        placeholder="Select field"
        searchPlaceholder="Search fields..."
        emptyText="No field found."
        className="w-40"
      />

      <Combobox
        options={operators.map(op => ({ value: op.value, label: op.label }))}
        value={condition.op || ""}
        onValueChange={value =>
          onChange({ ...condition, op: value as Operator })
        }
        placeholder={
          !condition.attribute ? "Select field first" : "Select operator"
        }
        searchPlaceholder="Search operators..."
        emptyText="No operator found."
        className="w-48"
        disabled={!condition.attribute}
      />

      {needsValue && renderValueInput(condition, onChange, selectedAttribute)}

      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

interface FilterGroupComponentProps {
  group: FilterGroup;
  onChange: (group: FilterGroup) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  level?: number;
  attributes: Array<{ value: string; label: string }>;
}

const FilterGroupComponent: React.FC<FilterGroupComponentProps> = ({
  group,
  onChange,
  onDelete,
  canDelete = false,
  level = 0,
  attributes,
}) => {
  const { config } = useLensContext();

  const addCondition = () => {
    const newCondition = createEmptyCondition("", config?.attributes || {});
    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = {
      op: "and",
      conditions: [createEmptyCondition("", config?.attributes || {})],
    };
    onChange({
      ...group,
      conditions: [...group.conditions, newGroup],
    });
  };

  const updateCondition = (
    index: number,
    newCondition: Condition | FilterGroup
  ) => {
    const newConditions = [...group.conditions];
    newConditions[index] = newCondition;
    onChange({
      ...group,
      conditions: newConditions,
    });
  };

  const deleteCondition = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index);
    if (newConditions.length === 0) {
      // If this would leave an empty group, add a default condition
      newConditions.push(createEmptyCondition("", config?.attributes || {}));
    }
    onChange({
      ...group,
      conditions: newConditions,
    });
  };

  const isCondition = (item: Condition | FilterGroup): item is Condition => {
    return "attribute" in item;
  };

  // Check if all conditions are simple conditions (not groups)
  const hasOnlyConditions = group.conditions.every(isCondition);
  // Check if all conditions are groups (not simple conditions)
  const hasOnlyGroups = group.conditions.every(
    condition => !isCondition(condition)
  );

  return (
    <div
      className={cn(
        "bg-background space-y-3 rounded-lg border p-4",
        level > 0 && "border-l-primary/20 ml-4 border-l-4"
      )}
    >
      {/* Group header with AND/OR toggle and delete button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            {level === 0 ? "Filter by" : "Group"}
          </span>
          <Select
            value={group.op}
            onValueChange={(value: "and" | "or") =>
              onChange({ ...group, op: value })
            }
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">AND</SelectItem>
              <SelectItem value="or">OR</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm">
            of the following:
          </span>
        </div>

        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Conditions and nested groups */}
      <div className="space-y-2">
        {group.conditions.map((condition, index) => (
          <div key={index}>
            {isCondition(condition) ? (
              <ConditionRow
                condition={condition}
                onChange={newCondition => updateCondition(index, newCondition)}
                onDelete={() => deleteCondition(index)}
                canDelete={group.conditions.length > 1}
                attributes={attributes}
              />
            ) : (
              <FilterGroupComponent
                group={condition}
                onChange={newGroup => updateCondition(index, newGroup)}
                onDelete={() => deleteCondition(index)}
                canDelete={true}
                level={level + 1}
                attributes={attributes}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="flex gap-2 pt-2">
        {/* Show "Add Condition" only when we have simple conditions or no conditions */}
        {hasOnlyConditions && (
          <Button
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Condition
          </Button>
        )}

        {/* Show "Add Group" only when we have simple conditions and at least one condition exists */}
        {hasOnlyConditions && group.conditions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Convert existing conditions to groups
              const existingConditionsAsGroup: FilterGroup = {
                op: "and",
                conditions: [...group.conditions],
              };

              const newGroup: FilterGroup = {
                op: "and",
                conditions: [
                  createEmptyCondition("", config?.attributes || {}),
                ],
              };

              onChange({
                ...group,
                conditions: [existingConditionsAsGroup, newGroup],
              });
            }}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Group
          </Button>
        )}

        {/* Show "Add Group" normally when we already have groups */}
        {hasOnlyGroups && (
          <Button
            variant="outline"
            size="sm"
            onClick={addGroup}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Group
          </Button>
        )}
      </div>
    </div>
  );
};

export interface FilterBuilderProps {
  value?: Filter;
  onChange?: (filter: Filter) => void;
  className?: string;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  value,
  onChange,
  className,
}) => {
  const { filters: contextFilters, setFilters } = useViewContext();
  const { config } = useLensContext();

  // Get attributes from config
  const attributes = React.useMemo(() => {
    const attrs = config?.attributes || {};
    return Object.entries(attrs).map(([key, attr]) => ({
      value: key,
      label: attr.label || key,
    }));
  }, [config]);

  const [filter, setFilter] = useState<Filter>(() => {
    const initial = value || contextFilters || {};
    // Normalize filters to ensure consistent property order
    const normalized =
      Object.keys(initial).length > 0 ? normalizeFilters(initial) : initial;
    console.log("FilterBuilder mount:", {
      value,
      contextFilters,
      initial,
      normalized,
    });
    return normalized;
  });

  const handleChange = (newFilter: Filter) => {
    setFilter(newFilter);
    onChange?.(newFilter);
  };

  const clearAll = () => {
    const emptyFilter = {};
    setFilter(emptyFilter);
    // Don't call onChange here - wait for user to click Apply
    // This prevents the immediate API call on clear
  };

  const addFirstCondition = () => {
    const newFilter: FilterGroup = {
      op: "and",
      conditions: [createEmptyCondition("", config?.attributes || {})],
    };
    handleChange(newFilter);
  };

  const handleGroupChange = (newGroup: FilterGroup) => {
    // Check if we can flatten - if there's only one group and it contains only conditions
    if (
      newGroup.conditions.length === 1 &&
      newGroup.conditions.every(item => !("op" in item && "conditions" in item))
    ) {
      // This is a group with only one condition, but we still keep it as a group
      handleChange(newGroup);
    } else if (
      newGroup.conditions.length === 1 &&
      "op" in newGroup.conditions[0] &&
      "conditions" in newGroup.conditions[0]
    ) {
      // If there's only one group left, flatten it
      handleChange(newGroup.conditions[0] as FilterGroup);
    } else {
      handleChange(newGroup);
    }
  };

  const isEmpty = !("op" in filter && "conditions" in filter);

  const handleApply = () => {
    console.log("Applying filters:", filter);
    // Always create a new object reference to ensure React detects the change
    // This is important when clearing filters and reapplying empty filters
    setFilters(isEmpty ? {} : { ...filter });
  };

  return (
    <div className="flex max-h-[400px] min-h-[200px] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
          <RotateCcw className="h-3 w-3" />
          Clear All
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={cn("w-full", className)}>
          {isEmpty ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground text-sm font-medium">
                  No filters applied
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFirstCondition}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Condition
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FilterGroupComponent
                group={filter as FilterGroup}
                onChange={handleGroupChange}
                level={0}
                attributes={attributes}
              />
            </div>
          )}

          {/* Debug output - remove in production */}
          <details className="mt-4">
            <summary className="text-muted-foreground cursor-pointer text-sm">
              View JSON Output
            </summary>
            <pre className="bg-muted mt-2 overflow-auto rounded p-3 text-xs">
              {JSON.stringify(filter, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Footer with Apply button */}
      <div className="flex justify-end border-t px-4 py-3">
        <Button size="sm" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

// Helper function to render value input based on attribute type
function renderValueInput(
  condition: Condition,
  onChange: (condition: Condition) => void,
  attribute?: FilterAttribute
) {
  const type = attribute?.type || "string";
  const options = attribute?.options || [];

  // For enum types with options, show a combobox
  if (type === "enum" && options.length > 0) {
    const isMultiple =
      condition.op === "is_any_of" || condition.op === "is_none_of";

    if (isMultiple) {
      // For multiple selection, we need a multi-select component
      // For now, use comma-separated values in input
      return (
        <Input
          value={
            Array.isArray(condition.value)
              ? condition.value.join(", ")
              : (condition.value as string)
          }
          onChange={e => {
            const values = e.target.value
              .split(",")
              .map(v => v.trim())
              .filter(Boolean);
            onChange({ ...condition, value: values });
          }}
          placeholder="Enter values separated by commas"
          className="flex-1"
        />
      );
    }

    // Single selection
    return (
      <Combobox
        options={options}
        value={condition.value as string}
        onValueChange={value => onChange({ ...condition, value })}
        placeholder="Select value"
        searchPlaceholder="Search values..."
        emptyText="No value found."
        className="flex-1"
      />
    );
  }

  // For date types, we could add a date picker here
  // For now, use standard input
  return (
    <Input
      value={condition.value as string}
      onChange={e => onChange({ ...condition, value: e.target.value })}
      placeholder={getPlaceholderForType(type)}
      className="flex-1"
      type={getInputTypeForAttributeType(type)}
    />
  );
}

// Get appropriate input type based on attribute type
function getInputTypeForAttributeType(type: AttributeType): string {
  switch (type) {
    case "integer":
    case "number":
    case "decimal":
      return "number";
    case "date":
      return "date";
    case "datetime":
    case "timestamp":
      return "datetime-local";
    default:
      return "text";
  }
}

// Get placeholder text based on attribute type
function getPlaceholderForType(type: AttributeType): string {
  switch (type) {
    case "integer":
    case "number":
    case "decimal":
      return "Enter number";
    case "date":
      return "Select date";
    case "datetime":
    case "timestamp":
      return "Select date and time";
    case "boolean":
      return "true or false";
    default:
      return "Enter value";
  }
}

export default FilterBuilder;
