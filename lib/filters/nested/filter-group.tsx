import { useLensViewContext } from "@lens2/contexts/lens-view-context";
import {
  applyCascadeToFilterGroup,
  type CascadeContext,
} from "@lens2/filters/logic/cascade-filter-manager";
import { createEmptyCondition } from "@lens2/filters/logic/initialize-filter";
import { ConditionRow } from "@lens2/filters/nested/condition-row";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lens2/shadcn/components/ui/toggle-group";
import { cn } from "@lens2/shadcn/lib/utils";
import type { Condition, FilterGroup } from "@lens2/types/filters";
import { Plus } from "lucide-react";
import React from "react";

interface FilterGroupComponentProps {
  group: FilterGroup;
  onChange: (group: FilterGroup) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  level?: number;
  maxDepth?: number;
  attributes: Array<{ value: string; label: string }>;
  uniqueFilters?: boolean;
  currentFilters?: FilterGroup;
}

export const FilterGroupComponent: React.FC<FilterGroupComponentProps> = ({
  group,
  onChange,
  onDelete,
  canDelete = false,
  level = 0,
  maxDepth = 1,
  attributes,
  uniqueFilters,
  currentFilters,
}) => {
  const { attributes: contextAttributes } = useLensViewContext();

  const addCondition = () => {
    const newCondition = createEmptyCondition("", contextAttributes);
    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = {
      op: "and",
      conditions: [createEmptyCondition("", contextAttributes)],
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
    const oldCondition = group.conditions[index];
    const newConditions = [...group.conditions];
    newConditions[index] = newCondition;

    let updatedGroup: FilterGroup = {
      ...group,
      conditions: newConditions,
    };

    // Apply cascade clearing if this is a simple condition change and uniqueFilters is enabled
    if (
      uniqueFilters &&
      "attribute" in oldCondition &&
      "attribute" in newCondition &&
      oldCondition.attribute &&
      newCondition.attribute
    ) {
      // Check if attribute or value changed
      const attributeChanged =
        oldCondition.attribute !== newCondition.attribute;
      const valueChanged =
        JSON.stringify(oldCondition.value) !==
        JSON.stringify(newCondition.value);

      if (attributeChanged || valueChanged) {
        const cascadeContext: CascadeContext = {
          isUserAction: true,
          sourceAttribute: newCondition.attribute,
          action: attributeChanged ? "update" : "update",
          previousValue: oldCondition.value,
          newValue: newCondition.value,
        };

        // Apply cascade clearing to the updated group
        updatedGroup = applyCascadeToFilterGroup(
          updatedGroup,
          cascadeContext,
          contextAttributes
        ) as FilterGroup;
      }
    }

    onChange(updatedGroup);
  };

  const deleteCondition = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index);
    if (newConditions.length === 0) {
      // If this would leave an empty group, add a default condition
      newConditions.push(createEmptyCondition("", contextAttributes));
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

  // Get attributes already used in this group (for uniqueFilters)
  const usedAttributes = uniqueFilters
    ? group.conditions
        .filter(isCondition)
        .map(c => c.attribute)
        .filter(attr => attr) // Remove empty attributes
    : [];

  // Filter available attributes for a condition
  const getFilteredAttributes = (currentAttribute?: string) => {
    if (!uniqueFilters || usedAttributes.length === 0) {
      return attributes;
    }

    return attributes.filter(
      attr =>
        attr.value === currentAttribute || // Keep current attribute visible when editing
        !usedAttributes.includes(attr.value)
    );
  };

  return (
    <div className={cn("space-y-2", level > 0 && "bg-muted/80 rounded-lg p-3")}>
      {/* Group header with AND/OR toggle */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={group.op}
            onValueChange={value => {
              if (value) onChange({ ...group, op: value as "and" | "or" });
            }}
            className="bg-muted border-border h-7 overflow-hidden rounded-full border"
          >
            <ToggleGroupItem
              value="and"
              aria-label="AND operator"
              className="data-[state=off]:text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background h-7 rounded-none px-3 text-xs font-medium first:rounded-l-full last:rounded-r-full data-[state=off]:bg-transparent"
            >
              and
            </ToggleGroupItem>
            <ToggleGroupItem
              value="or"
              aria-label="OR operator"
              className="data-[state=off]:text-muted-foreground data-[state=on]:bg-foreground data-[state=on]:text-background h-7 rounded-none px-3 text-xs font-medium first:rounded-l-full last:rounded-r-full data-[state=off]:bg-transparent"
            >
              or
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Clear all button for nested groups */}
        {canDelete && onDelete && level > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={onDelete}
            className="text-muted-foreground hover:text-foreground h-auto p-0"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Conditions and nested groups */}
      <div className="relative">
        {/* Vertical connecting line */}
        {group.conditions.length > 1 && (
          <div className="bg-border absolute top-4 bottom-4 left-2 w-px" />
        )}

        <div className="space-y-2">
          {group.conditions.map((condition, index) => (
            <div key={index} className="relative">
              {/* Horizontal connector */}
              {group.conditions.length > 1 && (
                <div className="bg-border absolute top-1/2 left-2 h-px w-3" />
              )}

              <div className={group.conditions.length > 1 ? "ml-5" : ""}>
                {isCondition(condition) ? (
                  <ConditionRow
                    condition={condition}
                    onChange={newCondition =>
                      updateCondition(index, newCondition)
                    }
                    onDelete={() => deleteCondition(index)}
                    canDelete={group.conditions.length > 1}
                    attributeOptions={getFilteredAttributes(
                      condition.attribute
                    )}
                    currentFilters={currentFilters}
                    uniqueFilters={uniqueFilters}
                  />
                ) : (
                  <FilterGroupComponent
                    group={condition}
                    onChange={newGroup => updateCondition(index, newGroup)}
                    onDelete={() => deleteCondition(index)}
                    canDelete={true}
                    level={level + 1}
                    maxDepth={maxDepth}
                    attributes={attributes}
                    uniqueFilters={uniqueFilters}
                    currentFilters={condition}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Condition button */}
      {(hasOnlyConditions || level >= maxDepth) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={addCondition}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Condition
        </Button>
      )}

      {/* Add Group button */}
      {level < maxDepth && hasOnlyConditions && group.conditions.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Convert existing conditions to groups
            const existingConditionsAsGroup: FilterGroup = {
              op: "and",
              conditions: [...group.conditions],
            };

            const newGroup: FilterGroup = {
              op: "and",
              conditions: [createEmptyCondition("", contextAttributes)],
            };

            onChange({
              ...group,
              conditions: [existingConditionsAsGroup, newGroup],
            });
          }}
          className={cn(
            "text-muted-foreground hover:text-foreground",
            hasOnlyConditions && "mt-2"
          )}
        >
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      )}

      {/* Show "Add Group" when below maxDepth and we already have groups */}
      {level < maxDepth && hasOnlyGroups && (
        <Button
          variant="ghost"
          size="sm"
          onClick={addGroup}
          className="text-muted-foreground hover:text-foreground mt-2"
        >
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      )}
    </div>
  );
};
