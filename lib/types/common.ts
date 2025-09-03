/**
 * Common types used throughout the LensView component
 */

// JSON type that can represent any valid JSON value
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

// Common status types
export type Status = "idle" | "loading" | "success" | "error";

// Error with optional metadata
export interface ErrorWithMetadata extends Error {
  code?: string;
  metadata?: Json;
}

// Row data type for tables
export type RowData = Record<string, Json>;
