export interface ChipFilter {
  id: string;
  attribute: string;
  operator: string;
  value: unknown;
  displayValue?: string; // For complex values like enums or relationships
  sessionId?: string; // To track which session created/modified this filter
}

export interface ChipFilterSession {
  isActive: boolean;
  sessionId: string;
  sessionFilters: Map<string, ChipFilter>; // attribute -> filter mapping
  startTime: number;
}

export interface ChipFilterState {
  filters: ChipFilter[];
  activeSession: ChipFilterSession | null;
}

import type { Attribute } from "@lens2/types/attributes";

export interface ChipValueInputProps {
  attribute: Attribute;
  value: unknown;
  onChange: (value: unknown) => void;
  operator?: string;
  onClear?: () => void;
  className?: string;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export interface ChipConditionProps {
  filter: ChipFilter;
  attribute: Attribute;
  onUpdate: (filter: ChipFilter) => void;
  onRemove: (id: string) => void;
  isEditing?: boolean;
}
