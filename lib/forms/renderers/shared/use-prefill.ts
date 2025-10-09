import { useCallback, useEffect, useMemo } from "react";

export interface PrefillMapping {
  [targetField: string]: string; // source path
}

export interface UsePrefillParams {
  selectedValue: string | string[] | null;
  prefillMapping?: PrefillMapping;
  fieldPath: string;
  onFieldUpdate: (path: string, value: any) => void;
  options: Array<{ value: string; label: string; [key: string]: any }>;
  onPrefilledFields?: (fieldPaths: string[]) => void;
  onTriggerFieldRefetch?: (fieldPath: string, value: any) => void;
}

/**
 * Simple prefill hook that triggers when a value is selected
 */
export function usePrefill({
  selectedValue,
  prefillMapping,
  fieldPath,
  onFieldUpdate,
  options,
  onPrefilledFields,
  onTriggerFieldRefetch,
}: UsePrefillParams) {
  // Get the selected option data
  const selectedOptionData = useMemo(() => {
    if (!selectedValue || !options.length) return null;

    const value = Array.isArray(selectedValue)
      ? selectedValue[0]
      : selectedValue;
    return options.find(option => option.value === value) || null;
  }, [selectedValue, options]);

  // Handle prefill when selection changes
  useEffect(() => {
    if (!selectedOptionData || !prefillMapping) return;

    console.log("Prefill triggered for field:", fieldPath);
    console.log("Selected option data:", selectedOptionData);
    console.log("Prefill mapping:", prefillMapping);

    const prefilledFields: string[] = [];

    // Apply prefill mapping
    Object.entries(prefillMapping).forEach(([targetField, sourcePath]) => {
      const value = getNestedValue(selectedOptionData, sourcePath);

      if (value !== null && value !== undefined) {
        console.log(`Prefilling ${targetField} with value:`, value);
        onFieldUpdate(targetField, value);
        prefilledFields.push(targetField);

        // Trigger refetch for the prefilled field to get its label
        if (onTriggerFieldRefetch) {
          console.log(
            `Triggering refetch for ${targetField} with value:`,
            value
          );
          onTriggerFieldRefetch(targetField, value);
        }
      }
    });

    // Notify about prefilled fields
    if (prefilledFields.length > 0 && onPrefilledFields) {
      console.log("Calling onPrefilledFields with:", prefilledFields);
      onPrefilledFields(prefilledFields);
    }
  }, [
    selectedOptionData,
    prefillMapping,
    fieldPath,
    onFieldUpdate,
    onPrefilledFields,
  ]);

  // Helper function to get nested value
  const getNestedValue = useCallback((obj: any, path: string) => {
    if (!obj || !path) return null;
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }, []);

  return {
    selectedOptionData,
    fieldPrefillMapping: prefillMapping,
    handlePrefill: () => {}, // Not needed with useEffect
    fullSelectedData: selectedOptionData,
    isLoadingFullData: false,
  };
}
