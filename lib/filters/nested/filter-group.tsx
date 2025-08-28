import { useLensContext } from "@lens2/contexts/lens-context";
import { ConditionRow } from "@lens2/filters/nested/condition-row";
import { createEmptyCondition } from "@lens2/filters/logic/initialize-filter";
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
}

export const FilterGroupComponent: React.FC<FilterGroupComponentProps> = ({
  group,
  onChange,
  onDelete,
  canDelete = false,
  level = 0,
  maxDepth = 1,
  attributes,
}) => {
  const { attributes: contextAttributes } = useLensContext();

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
                    attributeOptions={attributes}
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
