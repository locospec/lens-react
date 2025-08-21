import { useLensContext } from "@lens2/contexts/lens-context";
import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
import { AttributeSelector } from "@lens2/filters/advanced/attribute-selector";
import { OperatorSelector } from "@lens2/filters/advanced/operator-selector";
import { renderValueInput } from "@lens2/filters/advanced/value-input";
import {
  getOperatorsForType,
  operatorRequiresValue,
} from "@lens2/filters/logic/filter-operators-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import type { Condition, Operator } from "@lens2/types/filters";
import * as logger from "@lens2/utils/logger";
import { Trash2 } from "lucide-react";
import React, { useMemo } from "react";

interface ConditionRowProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onDelete: () => void;
  canDelete: boolean;
  attributeOptions: Array<{ value: string; label: string }>;
}

const ConditionRowComponent: React.FC<ConditionRowProps> = ({
  condition,
  onChange,
  onDelete,
  canDelete,
  attributeOptions,
}) => {
  const { attributes } = useLensContext();
  const { enabled: debugEnabled } = useLensDebugClient();

  // Get the selected attribute
  const selectedAttribute = attributes[condition.attribute];
  const attributeType = selectedAttribute?.type;

  // Get operators for the selected attribute type
  const operators = useMemo(() => {
    if (!condition.attribute || !selectedAttribute || !attributeType) return [];
    // Always include null operators for all types
    return getOperatorsForType(attributeType, true);
  }, [condition.attribute, attributeType, selectedAttribute]);

  // Check if current operator requires a value
  const needsValue =
    condition.attribute && condition.op && attributeType
      ? operatorRequiresValue(attributeType, condition.op)
      : false;

  // Handle attribute change
  const handleAttributeChange = (value: string) => {
    const newAttribute = attributes[value];

    if (!newAttribute) {
      logger.error(`Attribute "${value}" not found in enriched attributes`);
      return;
    }

    onChange({
      ...condition,
      attribute: value,
      op: newAttribute.defaultOperator as Operator,
      value: "", // Reset value when attribute changes
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <AttributeSelector
          options={attributeOptions}
          value={condition.attribute}
          onValueChange={handleAttributeChange}
          placeholder="Select field"
          searchPlaceholder="Search fields..."
          emptyText="No field found."
          className="w-48"
        />
        {debugEnabled && selectedAttribute && (
          <span className="text-muted-foreground/50 absolute -bottom-4 left-1 font-mono text-[10px]">
            {attributeType}
          </span>
        )}
      </div>

      <OperatorSelector
        operators={operators}
        value={condition.op}
        onValueChange={value =>
          onChange({ ...condition, op: value as Operator })
        }
        placeholder={
          !condition.attribute ? "Select field first" : "Select operator"
        }
        searchPlaceholder="Search operators..."
        emptyText="No operator found."
        className="w-40"
        disabled={!condition.attribute}
      />

      <div className="flex flex-1 items-center gap-2">
        {needsValue && renderValueInput(condition, onChange, selectedAttribute)}
      </div>

      {canDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="ml-auto h-8 w-8 p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// It will only re-render when its props change
export const ConditionRow = React.memo(ConditionRowComponent);
