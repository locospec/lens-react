/**
 * Attribute-related types
 */

// Common attribute types used in models
export type AttributeType =
  | "string"
  | "text"
  | "longtext"
  | "integer"
  | "number"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "timestamp"
  | "enum";

// Base attribute definition with all properties
export interface Attribute {
  name: string;
  label: string;
  type: AttributeType;
  primaryKey?: boolean;

  // Filter-specific properties
  filterAttribute?: string; // The actual attribute to use when filtering (may differ from name)
  defaultOperator: string; // Default operator for this attribute type
  aggregatorKeys?: {
    valueKey: string; // Key for the ID/value field in aggregator response
    labelKey: string; // Key for the label/name field in aggregator response
    countKey: string; // Key for the count field in aggregator response
  };

  // Optional properties for filters and advanced features
  optionsAggregator?: string; // Aggregator name for dynamic options
  options?: Array<{ label: string; value: string; count?: number }>; // Static enum options
}

// Display configuration for attributes
export interface DisplayAttribute {
  attribute: string;
  label?: string;
}
