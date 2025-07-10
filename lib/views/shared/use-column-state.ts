import type { Attribute } from "@lens2/contexts/view-context";
import type { RowData } from "@lens2/types/common";
import type { ViewConfig } from "@lens2/types/view";
import {
  ColumnDef,
  ColumnOrderState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { COLUMN_SIZES } from "./constants";

interface UseColumnStateProps {
  attributes: Attribute[];
  viewConfig?: ViewConfig;
}

function buildTableColumns(attributes: Attribute[]): ColumnDef<RowData>[] {
  if (!attributes || attributes.length === 0) {
    console.warn("No attributes available for table view");
    return [];
  }

  // Simple column generation from attributes
  return attributes.map((attr: Attribute): ColumnDef<RowData> => {
    return {
      id: attr.name,
      accessorKey: attr.name,
      header: attr.label,
      size: COLUMN_SIZES.DEFAULT,
      minSize: COLUMN_SIZES.MIN,
      maxSize: COLUMN_SIZES.MAX,
      meta: {
        type: attr.type,
        label: attr.label,
        primaryKey: attr.primaryKey,
      },
    };
  });
}

export function useColumnState({
  attributes,
  viewConfig,
}: UseColumnStateProps) {
  // Build columns with saved or default sizes
  const columns = useMemo(() => {
    const cols = buildTableColumns(attributes);
    // Override with saved column sizes if available
    if (viewConfig?.columnSizes) {
      return cols.map(col => ({
        ...col,
        size: viewConfig.columnSizes?.[col.id as string] || col.size,
      }));
    }
    return cols;
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
