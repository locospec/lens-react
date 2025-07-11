import { useViewContext } from "@lens2/contexts/view-context";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import { COLUMN_SIZES, FETCH_CONFIG } from "@lens2/views/shared/constants";
import { EmptyState } from "@lens2/views/shared/empty-state";
import { LoadingState } from "@lens2/views/shared/loading-state";
import { useColumnResizeSave } from "@lens2/views/shared/use-column-resize-save";
import { useColumnSizeVars } from "@lens2/views/shared/use-column-size-vars";
import { useColumnState } from "@lens2/views/shared/use-column-state";
import { useContainerWidth } from "@lens2/views/shared/use-container-width";
import { useRowVirtualizer } from "@lens2/views/shared/use-row-virtualizer";
import { useViewData } from "@lens2/views/shared/use-view-data";
import { ViewHeader } from "@lens2/views/shared/view-header";
import {
  ColumnSizingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import { MemoizedTableBody, TableBody } from "./table-body";
import { TableHeader } from "./table-header";

export function TableView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { updateConfigChange } = useViewConfig();
  const { setTable } = useViewContext();

  // Get data and config using shared hook
  const {
    attributes,
    view,
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    totalCount,
  } = useViewData({ defaultPerPage: FETCH_CONFIG.DEFAULT_PER_PAGE });

  // Column state management
  const {
    columns,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
  } = useColumnState({ attributes, viewConfig: view.config });

  // Column sizing state
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(
    () => view.config?.columnSizes || {}
  );

  // Table instance
  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: false,
    columnResizeMode: "onChange",
    state: {
      columnVisibility,
      columnOrder,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    defaultColumn: {
      size: COLUMN_SIZES.DEFAULT,
      minSize: COLUMN_SIZES.MIN,
      maxSize: COLUMN_SIZES.MAX,
    },
  });

  // Get all rows
  const { rows } = table.getRowModel();

  // Set table instance in context
  useEffect(() => {
    setTable(table);
    return () => setTable(null); // Cleanup on unmount
  }, [table, setTable]);

  // Column resize saving
  const { isResizing } = useColumnResizeSave({ table, updateConfigChange });

  // Row virtualizer
  const columnVisibilityKey = JSON.stringify(columnVisibility);
  const rowVirtualizer = useRowVirtualizer({
    rowCount: rows.length,
    containerRef,
  });

  // Container width tracking
  const containerWidth = useContainerWidth(containerRef);

  // Column size CSS variables
  const columnSizeVars = useColumnSizeVars({
    table,
    parentWidth: containerWidth,
  });

  // Fetch more on scroll
  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      fetchMoreOnBottomReached(e.target as HTMLDivElement);
    },
    [fetchMoreOnBottomReached]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!columns.length) {
    return <EmptyState message="No columns configured" />;
  }

  return (
    <div ref={wrapperRef} className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title="Table View"
        loadedCount={flatData.length}
        totalCount={totalCount}
      />

      {/* Table container with border wrapper */}
      <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border">
        <div
          ref={containerRef}
          className="relative h-full overflow-auto"
          onScroll={handleScroll}
        >
          <div
            key={`${columnVisibilityKey}-${columnOrder.join(",")}`}
            className="group relative w-full data-[resizing=true]:cursor-ew-resize"
            style={{
              ...columnSizeVars,
              minWidth: table.getTotalSize(),
            }}
            data-resizing={isResizing ? "true" : "false"}
          >
            {/* Sticky Table Header */}
            <TableHeader table={table} />

            {/* Table Body with Virtualization */}
            {isResizing ? (
              <MemoizedTableBody
                table={table}
                rowVirtualizer={rowVirtualizer}
                isFetching={isFetching}
              />
            ) : (
              <TableBody
                table={table}
                rowVirtualizer={rowVirtualizer}
                isFetching={isFetching}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
