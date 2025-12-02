import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { Checkbox } from "@lens2/shadcn/components/ui/checkbox";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Label } from "@lens2/shadcn/components/ui/label";
import { ControlProps } from "@jsonforms/core";
import { useState } from "react";

type Slab = {
  key: string;
  percent: string;
  applyMaxCap: boolean;
  upperCap: string;
};

export const ShadcnDynamicInputRangeGroup = (props: ControlProps) => {
  const { path, handleChange, visible, label } = props;
  const { globalContext } = useLensFormContext();

  const slabsConfig: any =
    globalContext?.bid_mobilization_fee_slabs &&
    Array.isArray(globalContext?.bid_mobilization_fee_slabs)
      ? globalContext.bid_mobilization_fee_slabs
      : [];

  const [slabsData, setSlabsData] = useState<Slab[]>(
    slabsConfig?.map((slab: any) => ({
      key: slab.key,
      label: slab.label,
      config_uuid: slab.uuid,
      percent: "",
      applyMaxCap: false,
      upperCap: "",
    }))
  );

  // Correctly typed handleChange
  const handleFormArrayChange = <K extends keyof Slab>(
    index: number,
    field: K,
    value: Slab[K]
  ) => {
    setSlabsData(prev => {
      const newData = [...prev];
      newData[index][field] = value;

      handleChange(path, newData);

      return newData;
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-5">
      <p className="text-lg font-semibold">{label}</p>

      {slabsData?.map((slab, index) => (
        <div key={slab.key} className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label htmlFor={`percent-${index}`}>
              {slabsConfig[index].label}
            </Label>
            <Input
              id={`percent-${index}`}
              type="number"
              onWheel={(e: any) => e.target.blur()}
              className="mt-2 w-[300px] rounded-sm border"
              placeholder="%"
              value={slab.percent}
              onChange={e =>
                handleFormArrayChange(index, "percent", e.target.value)
              }
            />
          </div>

          <div className="mt-5 flex space-x-2">
            <Checkbox
              id={`checkbox-${index}`}
              checked={slab.applyMaxCap}
              onCheckedChange={(isChecked: boolean) => {
                handleFormArrayChange(index, "applyMaxCap", isChecked);
                if (!isChecked) handleFormArrayChange(index, "upperCap", "");
              }}
            />
            <Label htmlFor={`checkbox-${index}`}>Apply Max Cap</Label>
          </div>

          <div className="flex flex-col">
            <Label htmlFor={`uppercap-${index}`}>Uppercap Amount</Label>
            <Input
              onWheel={(e: any) => e.target.blur()}
              disabled={!slab.applyMaxCap}
              id={`uppercap-${index}`}
              type="number"
              className="mt-2 w-[300px] rounded-sm border"
              placeholder="e.g., upto 20,000"
              value={slab.upperCap}
              onChange={e =>
                handleFormArrayChange(index, "upperCap", e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
