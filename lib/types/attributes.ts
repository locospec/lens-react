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

// Base attribute definition
export interface Attribute {
  name: string;
  label: string;
  type: AttributeType;
  primaryKey?: boolean;
}

// Extended attribute for filter-specific properties
export interface FilterAttribute extends Attribute {
  // Filter-specific properties
  dependsOn?: string[]; // For dependent dropdowns
  relatedModelName?: string; // For API-based enum options
  options?: Array<{ label: string; value: string }>; // Static enum options
  selectionType?: "single" | "multiple"; // For enum fields
  isNullable?: boolean; // Allow null values
}
