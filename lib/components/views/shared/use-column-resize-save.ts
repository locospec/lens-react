import type { Table } from "@tanstack/react-table";
import { useEffect, useRef } from "react";

interface UseColumnResizeSaveProps {
  table: Table<any>;
  updateConfigChange: (key: string, value: any) => Promise<void>;
}

export function useColumnResizeSave({
  table,
  updateConfigChange,
}: UseColumnResizeSaveProps) {
  const columnSizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasResizedRef = useRef(false);
  const lastSavedSizesRef = useRef<string>("");

  // Check if table is resizing
  const isResizing = table.getState().columnSizingInfo.isResizingColumn;

  // Track when user is actively resizing
  useEffect(() => {
    if (isResizing) {
      hasResizedRef.current = true;
    }
  }, [isResizing]);

  // Watch for when resizing ends and save column sizes
  useEffect(() => {
    if (
      !isResizing &&
      hasResizedRef.current &&
      columnSizeTimeoutRef.current === null
    ) {
      // User just stopped resizing, wait a bit then save
      columnSizeTimeoutRef.current = setTimeout(async () => {
        const allColumnSizes: Record<string, number> = {};
        table.getAllColumns().forEach(column => {
          if (column.id && column.getSize) {
            allColumnSizes[column.id] = column.getSize();
          }
        });

        // Only save if we have actual size data and it's different from last save
        const sizesString = JSON.stringify(allColumnSizes);
        if (
          Object.keys(allColumnSizes).length > 0 &&
          sizesString !== lastSavedSizesRef.current
        ) {
          console.log("Saving all column sizes:", allColumnSizes);
          lastSavedSizesRef.current = sizesString;

          try {
            await updateConfigChange("columnSizes", allColumnSizes);
          } catch (error) {
            console.error("Failed to save column sizes:", error);
            // Reset on error so it can be retried
            lastSavedSizesRef.current = "";
          }
        }

        columnSizeTimeoutRef.current = null;
        hasResizedRef.current = false; // Reset the flag
      }, 500); // 500ms debounce delay after resize ends
    }

    // Cleanup function
    return () => {
      if (columnSizeTimeoutRef.current) {
        clearTimeout(columnSizeTimeoutRef.current);
        columnSizeTimeoutRef.current = null;
      }
    };
  }, [isResizing, updateConfigChange]);

  return { isResizing };
}
