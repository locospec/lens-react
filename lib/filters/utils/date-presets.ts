/**
 * Date preset utilities for smart date filtering
 * Frontend definitions for UI display - actual date resolution handled by backend
 */

export type DatePresetValue =
  | "today"
  | "yesterday"
  | "tomorrow"
  | "next_7_days"
  | "last_7_days"
  | "this_week"
  | "next_week"
  | "last_week"
  | "last_month"
  | "this_month"
  | "next_month"
  | "last_quarter"
  | "this_quarter"
  | "next_quarter"
  | "overdue"
  | "later_than_today"
  | "today_and_earlier"
  | "custom_date"
  | "date_range";

export interface DatePreset {
  value: DatePresetValue;
  label: string;
  type: "single" | "range" | "custom";
}

// Date preset definitions for UI display
export const DATE_PRESETS: DatePreset[] = [
  { value: "today", label: "Today", type: "single" },
  { value: "yesterday", label: "Yesterday", type: "single" },
  { value: "tomorrow", label: "Tomorrow", type: "single" },
  { value: "next_7_days", label: "Next 7 days", type: "range" },
  { value: "last_7_days", label: "Last 7 days", type: "range" },
  { value: "this_week", label: "This week", type: "range" },
  { value: "next_week", label: "Next week", type: "range" },
  { value: "last_week", label: "Last week", type: "range" },
  { value: "last_month", label: "Last month", type: "range" },
  { value: "this_month", label: "This month", type: "range" },
  { value: "next_month", label: "Next month", type: "range" },
  { value: "today_and_earlier", label: "Today & Earlier", type: "range" },
  { value: "last_quarter", label: "Last quarter", type: "range" },
  { value: "this_quarter", label: "This quarter", type: "range" },
  { value: "next_quarter", label: "Next quarter", type: "range" },
  { value: "overdue", label: "Overdue", type: "range" },
  { value: "later_than_today", label: "Later than Today", type: "range" },
  // Special options that trigger custom pickers
  { value: "custom_date", label: "Custom date", type: "custom" },
  { value: "date_range", label: "Date range", type: "custom" },
];

/**
 * Get preset definition by value
 */
export function getDatePreset(preset: DatePresetValue): DatePreset | undefined {
  return DATE_PRESETS.find(p => p.value === preset);
}

/**
 * Check if a preset requires custom input (date picker)
 */
export function isCustomPreset(preset: DatePresetValue): boolean {
  return preset === "custom_date" || preset === "date_range";
}

/**
 * Check if a preset resolves to a date range
 */
export function isRangePreset(preset: DatePresetValue): boolean {
  const presetDef = getDatePreset(preset);
  return presetDef?.type === "range" || preset === "date_range";
}
