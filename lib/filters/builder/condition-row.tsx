import { useLensContext } from "@lens2/contexts/lens-context";
import { renderValueInput } from "@lens2/filters/builder/value-input";
import {
  getDefaultOperator,
  getOperatorsForType,
  operatorRequiresValue,
} from "@lens2/filters/utils/filter-operators-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Combobox } from "@lens2/shadcn/components/ui/combobox";
import type { AttributeType, FilterAttribute } from "@lens2/types/attributes";
import type { Condition, Operator } from "@lens2/types/filters";
import { Trash2 } from "lucide-react";
import React, { useMemo } from "react";

interface ConditionRowProps {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onDelete: () => void;
  canDelete: boolean;
  attributes: Array<{ value: string; label: string }>;
}

export const ConditionRow: React.FC<ConditionRowProps> = ({
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
    <div className="flex items-center gap-2">
      <Combobox
        options={attributes}
        value={condition.attribute}
        onValueChange={handleAttributeChange}
        placeholder="Select field"
        searchPlaceholder="Search fields..."
        emptyText="No field found."
        className="w-48"
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
