import { useState, useEffect, useMemo } from "react";
import { ColumnOrderState, VisibilityState } from "@tanstack/react-table";
import { buildTableColumns } from "./columns-builder";
import { COLUMN_SIZES } from "./constants";
import type { Attribute } from "@lens2/contexts/view-context";

interface ViewConfig {
  visibleColumns?: string[];
  columnOrder?: string[];
  columnSizes?: Record<string, number>;
}

interface UseColumnStateProps {
  attributes: Attribute[];
  viewConfig?: ViewConfig;
}

export function useColumnState({ attributes, viewConfig }: UseColumnStateProps) {
  // Build columns with saved or default sizes
  const columns = useMemo(() => {
    const cols = buildTableColumns(attributes);
    // Set column sizes from saved config or defaults
    return cols.map(col => ({
      ...col,
      size:
        viewConfig?.columnSizes?.[col.id as string] || COLUMN_SIZES.DEFAULT,
      minSize: COLUMN_SIZES.MIN,
      maxSize: COLUMN_SIZES.MAX,
    }));
  }, [attributes, viewConfig?.columnSizes]);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const visibleColumns =
        viewConfig?.visibleColumns || columns.map(c => c.id as string);
      return Object.fromEntries(
        columns.map(col => [col.id, visibleColumns.includes(col.id as string)])
      );
    }
  );

  // Column order state
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    return viewConfig?.columnOrder || columns.map(c => c.id as string);
  });

  // Update states when view config changes
  useEffect(() => {
    // Only update if we have columns
    if (columns.length === 0) return;

    const visibleColumns =
      viewConfig?.visibleColumns || columns.map(c => c.id as string);
    const newVisibility = Object.fromEntries(
      columns.map(col => [col.id, visibleColumns.includes(col.id as string)])
    );
    setColumnVisibility(prev => {
      // Only update if actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newVisibility)) {
        return newVisibility;
      }
      return prev;
    });

    const newOrder =
      viewConfig?.columnOrder || columns.map(c => c.id as string);
    setColumnOrder(prev => {
      // Only update if actually changed
      if (JSON.stringify(prev) !== JSON.stringify(newOrder)) {
        return newOrder;
      }
      return prev;
    });
  }, [viewConfig?.visibleColumns, viewConfig?.columnOrder, columns.length]);

  return {
    columns,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
  };
}