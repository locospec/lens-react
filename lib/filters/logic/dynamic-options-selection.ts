import type { DynamicOption } from "@lens2/filters/components/ui/dynamic-options-selector";

export interface SelectionHandlerParams {
  optionValue: string;
  options: DynamicOption[];
  selectedValues: string[];
  multiple: boolean;
  attribute: string;
  onValueChange?: (value: string | string[]) => void;
  setOption: (attribute: string, id: string, label: string) => void;
  onComplete?: () => void;
}

export function handleOptionSelection({
  optionValue,
  options,
  selectedValues,
  multiple,
  attribute,
  onValueChange,
  setOption,
  onComplete,
}: SelectionHandlerParams) {
  // Find the option to get its label
  const option = options.find(opt => opt.value === optionValue);

  if (multiple) {
    const isDeselecting = selectedValues.includes(optionValue);
    const newValues = isDeselecting
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];

    // Cache management: add on select, skip on deselect (cache will be cleared on unmount if needed)
    if (!isDeselecting && option) {
      setOption(attribute, optionValue, option.label);
    }

    onValueChange?.(newValues);
  } else {
    // Cache the selected option
    if (option) {
      setOption(attribute, optionValue, option.label);
    }

    onValueChange?.(optionValue);
    onComplete?.();
  }
}

export function getDisplayText(
  selectedValues: string[],
  options: DynamicOption[],
  hydratedOptions: Map<string, string>,
  isHydrating: boolean,
  placeholder: string,
  multiple: boolean
) {
  if (selectedValues.length === 0)
    return { text: placeholder, fullText: placeholder, isLoading: false };

  // Check if we're still hydrating any selected values
  const needsHydration = selectedValues.some(value => {
    // If it's in current options, no hydration needed
    if (options.find(opt => opt.value === value)) return false;
    // If it's already hydrated, no hydration needed
    if (hydratedOptions.has(value)) return false;
    // Otherwise, it needs hydration
    return true;
  });

  // If hydrating, show loading state
  if (isHydrating && needsHydration) {
    return {
      text: `Loading ${selectedValues.length} item${selectedValues.length > 1 ? "s" : ""}...`,
      fullText: "",
      isLoading: true,
    };
  }

  // Build array of labels for all selected values
  const labels = selectedValues.map(value => {
    // Check current options first
    const option = options.find(opt => opt.value === value);
    if (option) return option.label;

    // Then check hydrated options
    const label = hydratedOptions.get(value);
    if (label) return label;

    // Fallback to value (ID) - this happens if hydration failed
    return `Unknown (${value})`;
  });

  // For single selection, just return the label
  if (!multiple) {
    return { text: labels[0], fullText: labels[0], isLoading: false };
  }

  // For multiple selection, show comma-separated list
  const fullText = labels.join(", ");

  // Truncate if too long
  const maxLength = 50; // Adjust as needed
  if (fullText.length > maxLength) {
    return {
      text: fullText.substring(0, maxLength) + "...",
      fullText,
      isTruncated: true,
      isLoading: false,
    };
  }

  return { text: fullText, fullText, isLoading: false };
}
