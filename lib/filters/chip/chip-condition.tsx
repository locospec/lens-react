import { getOperatorsForType } from "@lens2/filters/logic/filter-operators-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lens2/shadcn/components/ui/dropdown-menu";
import { cn } from "@lens2/shadcn/lib/utils";
import type { Attribute } from "@lens2/types/attributes";
import type { FilterGroup } from "@lens2/types/filters";
import { ChevronDown, X } from "lucide-react";
import { useCallback, useState } from "react";
import { ChipValueInputInline } from "./chip-value-input-inline";
import { ChipFilter } from "./types";

interface ChipConditionRowProps {
  filter: ChipFilter;
  attribute: Attribute;
  onUpdate: (filter: ChipFilter) => void;
  onRemove: (id: string) => void;
  currentFilters?: FilterGroup;
  uniqueFilters?: boolean;
}

export function ChipCondition({
  filter,
  attribute,
  onUpdate,
  onRemove,
  currentFilters,
  uniqueFilters,
}: ChipConditionRowProps) {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const operators = getOperatorsForType(attribute.type, true);

  // Find the operator label
  const operatorLabel =
    operators.find(op => op.value === filter.operator)?.label ||
    filter.operator;

  // Handle operator change
  const handleOperatorChange = useCallback(
    (newOperator: string) => {
      onUpdate({
        ...filter,
        operator: newOperator,
      });
    },
    [filter, onUpdate]
  );

  // Handle value change
  const handleValueChange = useCallback(
    (newValue: unknown) => {
      onUpdate({
        ...filter,
        value: newValue,
      });
    },
    [filter, onUpdate]
  );

  return (
    <div className="bg-secondary inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
      {/* Attribute name - static */}
      <span className="font-medium">{attribute.label}</span>

      {/* Operator dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-auto p-0 px-1"
          >
            {operatorLabel}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {operators.map(op => (
            <DropdownMenuItem
              key={op.value}
              onClick={() => handleOperatorChange(op.value)}
              className={cn(
                "cursor-pointer",
                op.value === filter.operator && "bg-accent"
              )}
            >
              {op.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Value display/edit */}
      <ChipValueInputInline
        attribute={attribute}
        value={filter.value}
        operator={filter.operator}
        onChange={handleValueChange}
        onClear={() => handleValueChange(null)}
        className="h-6"
        isEditing={isEditingValue}
        onEditingChange={setIsEditingValue}
        currentFilters={currentFilters}
        uniqueFilters={uniqueFilters}
      />

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={() => onRemove(filter.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
