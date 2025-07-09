import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";

export interface UseColumnSizeVarsProps {
  table: Table<any>;
  parentWidth?: number;
}

export function useColumnSizeVars({
  table,
  parentWidth,
}: UseColumnSizeVarsProps) {
  return useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    let totalWidth = 0;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      const isLast = header.column.getIsLastColumn();
      const currentSize = header.getSize();
      const remainingWidth = parentWidth ? parentWidth - totalWidth : 0;

      // If it's the last column and we have space left, expand it
      if (isLast && parentWidth && currentSize < remainingWidth) {
        colSizes[`--header-${header.id}-size`] = remainingWidth;
        colSizes[`--col-${header.column.id}-size`] = remainingWidth;
        totalWidth += remainingWidth;
      } else {
        colSizes[`--header-${header.id}-size`] = currentSize;
        colSizes[`--col-${header.column.id}-size`] = currentSize;
        totalWidth += currentSize;
      }
    }

    return colSizes;
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    table.getState().columnVisibility,
    parentWidth,
  ]);
}
