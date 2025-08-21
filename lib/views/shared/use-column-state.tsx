import type { Attribute } from "@lens2/contexts/view-context";
import { Checkbox } from "@lens2/shadcn/components/ui/checkbox";
import { Radio } from "@lens2/shadcn/components/ui/radio";
import type { RowData } from "@lens2/types/common";
import type { EntityInteractions } from "@lens2/types/interactions";
import type { ViewConfig } from "@lens2/types/view";
import * as logger from "@lens2/utils/logger";
import {
  ColumnDef,
  ColumnOrderState,
  RowSelectionState,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { COLUMN_SIZES } from "./constants";

interface UseColumnStateProps {
  attributes: Attribute[];
  viewConfig?: ViewConfig;
  interactions?: EntityInteractions;
  selectionType?: "none" | "single" | "multiple";
}

function buildTableColumns(
  attributes: Attribute[],
  interactions?: EntityInteractions,
  selectionType?: "none" | "single" | "multiple"
): ColumnDef<RowData>[] {
  if (!attributes || attributes.length === 0) {
    logger.warn("No attributes available for table view");
    return [];
  }

  const columns: ColumnDef<RowData>[] = [];

  if (selectionType === "multiple") {
    columns.push({
      id: "__select",
      header: ({ table }) => (
        <Checkbox
          className="cursor-pointer transition-colors"
          checked={table.getIsAllPageRowsSelected()}
          onClick={e => {
            e.stopPropagation();
          }}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="cursor-pointer transition-colors"
          checked={row.getIsSelected()}
          onClick={e => {
            e.stopPropagation();
          }}
          onCheckedChange={v => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
      enableResizing: true,
      size: 40,
      maxSize: 40,
    });
  }

  if (selectionType === "single") {
    columns.push({
      id: "__select_single",
      header: "",
      size: 40,
      maxSize: 40,
      enableResizing: false,
      cell: ({ row }) => (
        <Radio
          className="cursor-pointer rounded-full transition-colors"
          value={row.id}
          checked={row.getIsSelected()}
          onClick={e => {
            e.stopPropagation();
            return row.toggleSelected(true);
          }}
        />
      ),
    });
  }

  // Generate columns from attributes
  columns.push(
    ...attributes.map((attr: Attribute): ColumnDef<RowData> => {
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
    })
  );

  // Add actions column at end if configured
  if (interactions?.actions) {
    columns.push({
      id: "__actions",
      header: "Actions",
      size: interactions.actions.width || 100,
      minSize: 60,
      maxSize: 200,
      enableResizing: false,
      cell: ({ row }) => interactions.actions!.render(row.original),
    });
  }

  return columns;
}

export function useColumnState({
  attributes,
  viewConfig,
  interactions,
  selectionType = "none",
}: UseColumnStateProps) {
  // Build columns with saved or default sizes

  const columns = useMemo(() => {
    const cols = buildTableColumns(attributes, interactions, selectionType);

    // Override with saved column sizes if available
    if (viewConfig?.columnSizes) {
      return cols.map(col => ({
        ...col,
        size: viewConfig.columnSizes?.[col.id as string] || col.size,
      }));
    }
    return cols;
  }, [attributes, interactions, viewConfig?.columnSizes, selectionType]);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const visibleColumns =
        viewConfig?.visibleColumns || columns.map(c => c.id as string);
      return Object.fromEntries(
        columns.map(col => [
          col.id,
          col.id === "__actions"
            ? true
            : visibleColumns.includes(col.id as string),
        ])
      );
    }
  );

  // Column order state
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const order = viewConfig?.columnOrder || columns.map(c => c.id as string);
    // Ensure __actions is at the end if it exists and not already in order
    if (interactions?.actions && !order.includes("__actions")) {
      return [...order, "__actions"];
    }
    return order;
  });

  // Update states when view config changes
  useEffect(() => {
    // Only update if we have columns
    if (columns.length === 0) return;

    const visibleColumns =
      viewConfig?.visibleColumns || columns.map(c => c.id as string);
    const newVisibility = Object.fromEntries(
      columns.map(col => [
        col.id,
        col.id === "__actions"
          ? true
          : visibleColumns.includes(col.id as string),
      ])
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
    // Ensure __actions is at the end if it exists and not already in order
    const orderWithActions =
      interactions?.actions && !newOrder.includes("__actions")
        ? [...newOrder, "__actions"]
        : newOrder;
    setColumnOrder(prev => {
      // Only update if actually changed
      if (JSON.stringify(prev) !== JSON.stringify(orderWithActions)) {
        return orderWithActions;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewConfig?.visibleColumns, viewConfig?.columnOrder, columns.length]); // columns and interactions?.actions are intentionally excluded

  const [rowSelection, _setRowSelection] = useState<RowSelectionState>({});

  // Wrap the setter to enforce single vs. multiple
  const setRowSelection = (
    updater:
      | RowSelectionState
      | ((prev: RowSelectionState) => RowSelectionState)
  ) => {
    _setRowSelection(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;

      if (selectionType === "single") {
        // pick the first selected key only
        const first = Object.keys(next).find(key => next[key]);
        return first ? { [first]: true } : {};
      } else if (selectionType === "multiple") {
        return next;
      }
      // none
      return {};
    });
  };

  return {
    columns,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    rowSelection,
    setRowSelection,
  };
}
