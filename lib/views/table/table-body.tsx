import { cn } from "@lens2/shadcn/lib/utils";
import type { RowData } from "@lens2/types/common";
import { LOADING_CONFIG } from "@lens2/views/shared/constants";
import { flexRender, Row, Table } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { memo } from "react";

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

  if (!rows.length) {
    return (
      <div
        className={cn(
          "relative h-full w-full p-4 pt-10 text-center",
          "text-muted-foreground"
        )}
      >
        {isFetching ? (
          <div className="text-sm">Loading...</div>
        ) : (
          <div className="text-sm">No data available</div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{
        height: `${rowVirtualizer.getTotalSize() + (isFetching ? LOADING_CONFIG.INDICATOR_HEIGHT : 0)}px`,
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
          className={cn(
            "absolute left-0 flex w-full items-center justify-center",
            "animate-pulse"
          )}
          style={{
            transform: `translateY(${rowVirtualizer.getTotalSize()}px)`,
            height: `${LOADING_CONFIG.INDICATOR_HEIGHT}px`,
          }}
        >
          <div className="text-muted-foreground text-sm">Loading more...</div>
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

const TableRow = memo(({ row, virtualRow, rowVirtualizer }: TableRowProps) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 flex w-full border-b transition-colors",
        "hover:bg-muted/50",
        "data-[state=selected]:bg-muted"
      )}
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && "selected"}
      ref={node => {
        if (node) rowVirtualizer.measureElement(node);
      }}
      style={{
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {row.getVisibleCells().map(cell => {
        return (
          <div
            key={cell.id}
            data-cell-column-id={cell.column.id}
            className={cn(
              "flex items-center overflow-hidden",
              "px-1 @sm/lens-table:px-1 @md/lens-table:px-1.5 @lg/lens-table:px-2",
              "py-1 @sm/lens-table:py-2 @md/lens-table:py-2.5 @lg/lens-table:py-3",
              "text-xs @sm/lens-table:text-xs @md/lens-table:text-sm @lg/lens-table:text-sm",
              "text-foreground"
              // "bg-blue-200 @sm/lens-table:bg-red-200 @md/lens-table:bg-yellow-200"
            )}
            style={{
              width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
            }}
          >
            <span className="truncate">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          </div>
        );
      })}
    </div>
  );
});

TableRow.displayName = "TableRow";

// Memoized version that only re-renders when data changes
export const MemoizedTableBody = memo(TableBody, (prevProps, nextProps) => {
  return (
    prevProps.table.options.data === nextProps.table.options.data &&
    prevProps.isFetching === nextProps.isFetching
  );
});
