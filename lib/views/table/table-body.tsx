import { useRowInteractions } from "@lens2/hooks/use-row-interactions";
import { cn } from "@lens2/shadcn/lib/utils";
import type { RowData } from "@lens2/types/common";
import { flexRender, Row, Table } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { memo } from "react";
import { TableSkeleton } from "./table-skeleton";

interface TableBodyProps {
  table: Table<RowData>;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  isFetching: boolean;
}

export const TableBody = ({
  table,
  rowVirtualizer,
  isFetching,
}: TableBodyProps) => {
  const { rows } = table.getRowModel();

  // Show skeleton for initial load when no rows but fetching
  if (!rows.length && isFetching) {
    const columnCount = table.getVisibleLeafColumns().length || 5;
    return (
      <div className="relative h-full w-full">
        <TableSkeleton rows={5} columns={columnCount} />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div
        className={cn(
          "relative h-full w-full p-8 pt-16 text-center",
          "text-muted-foreground"
        )}
      >
        <div className="text-sm font-medium">No data available</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{
        height: `${rowVirtualizer.getTotalSize() + (isFetching ? 200 : 0)}px`,
      }}
    >
      {rowVirtualizer.getVirtualItems().map(virtualRow => {
        const row = rows[virtualRow.index];
        return (
          <TableRow
            key={row.id}
            row={row}
            virtualRow={virtualRow}
            rowVirtualizer={rowVirtualizer}
          />
        );
      })}

      {isFetching && (
        <div
          className="absolute left-0 w-full"
          style={{
            transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
          }}
        >
          <TableSkeleton
            rows={3}
            columns={table.getVisibleLeafColumns().length || 5}
            className="opacity-60"
          />
          <div className="flex items-center justify-center py-2">
            <div className="text-muted-foreground animate-pulse text-sm">
              Loading more...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Table Row Component
interface TableRowProps {
  row: Row<RowData>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
}

const TableRow = ({ row, virtualRow, rowVirtualizer }: TableRowProps) => {
  const {
    handleRowClick,
    getAttributeClickHandler,
    getAttributeWrapper,
    RowWrapper,
    hasRowClickHandler,
  } = useRowInteractions();
  const rowData = row.original;

  const rowContent = (
    <div
      className={cn(
        "border-border absolute top-0 left-0 flex w-full border-b",
        virtualRow.index % 2 === 0 ? "" : "bg-muted/10",
        "hover:bg-muted/30 hover:shadow-sm",
        "data-[state=selected]:bg-muted/20",
        hasRowClickHandler && "cursor-pointer"
      )}
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && "selected"}
      ref={node => {
        if (node) rowVirtualizer.measureElement(node);
      }}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
      }}
      onClick={e => handleRowClick(rowData, e)}
    >
      {row.getVisibleCells().map(cell => {
        const columnId = cell.column.id;
        const value = cell.getValue();
        const CellWrapper =
          getAttributeWrapper(columnId) ||
          (({ children }: { children: React.ReactNode }) => children);
        const handleCellClick = getAttributeClickHandler(
          columnId,
          value,
          rowData
        );

        return (
          <div
            key={cell.id}
            data-cell-column-id={cell.column.id}
            className={cn(
              "flex items-center overflow-hidden",
              "px-1 @sm/lens-view-table:px-1 @md/lens-view-table:px-1.5 @lg/lens-view-table:px-2",
              "py-1.5 @sm/lens-view-table:py-2 @md/lens-view-table:py-2.5 @lg/lens-view-table:py-2.5",
              "text-xs @sm/lens-view-table:text-xs @md/lens-view-table:text-sm @lg/lens-view-table:text-sm",
              "text-foreground"
            )}
            style={{
              width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
            }}
            onClick={handleCellClick}
          >
            <CellWrapper value={value} rowData={rowData}>
              <span className="truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            </CellWrapper>
          </div>
        );
      })}
    </div>
  );

  return (
    <RowWrapper rowData={rowData} onClick={e => handleRowClick(rowData, e)}>
      {rowContent}
    </RowWrapper>
  );
};

TableRow.displayName = "TableRow";

// Memoized version that only re-renders when data changes
export const MemoizedTableBody = memo(TableBody, (prevProps, nextProps) => {
  return (
    prevProps.table.options.data === nextProps.table.options.data &&
    prevProps.isFetching === nextProps.isFetching
  );
});
