/**
 * Interaction-related types for LensView
 */

import type { RowData } from "./common";

// Entity interactions configuration
export interface EntityInteractions {
  // Simple row click handler
  onRowClick?: (params: { rowData: RowData; event?: React.MouseEvent }) => void;

  // Column-specific interactions
  attributeInteractions?: {
    [attributeKey: string]: {
      clickable?: boolean;
      onClick?: (params: {
        value: any;
        rowData: RowData;
        event?: React.MouseEvent;
      }) => void;
      // Custom cell wrapper component
      wrapper?: React.ComponentType<{
        value: any;
        rowData: RowData;
        children: React.ReactNode;
      }>;
      // Extra width to add for custom components (icons, buttons, etc.)
      extraWidth?: number;
    };
  };

  // Row wrapper component
  rowWrapper?: React.ComponentType<{
    rowData: RowData;
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
  }>;

  // Serial number column
  serialNumber?: {
    width?: number;
  };

  // Custom actions column (render only)
  actions?: {
    width?: number;
    render: (rowData: RowData) => React.ReactNode;
  };
}

/**
 * Selection and interaction configuration
 */
export interface SelectionConfiguration {
  selectionType?: "none" | "single" | "multiple";
  defaultSelected?: string[];
  onSelect?: React.Dispatch<React.SetStateAction<string[]>>;
  selectionKey?: string;
  interactions?: EntityInteractions;
}
