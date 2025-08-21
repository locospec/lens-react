import { HeaderContextMenu } from "@lens2/components/table/header-context-menu";
import { SortableHeaderCell } from "@lens2/components/table/sortable-header-cell";
import { cn } from "@lens2/shadcn/lib/utils";
import type { RowData } from "@lens2/types/common";
import { ResizeHandle } from "@lens2/views/shared/resize-handle";
import { Header, Table, flexRender } from "@tanstack/react-table";

interface TableHeaderProps {
  table: Table<RowData>;
}

export const TableHeader = ({ table }: TableHeaderProps) => {
  const isAnyColumnResizing =
    table.getState().columnSizingInfo.isResizingColumn !== null;

  return (
    <div
      className="bg-background border-border group sticky top-0 z-10 flex border-b"
      data-resizing={isAnyColumnResizing}
    >
      {table.getHeaderGroups().map(headerGroup => (
        <div key={headerGroup.id} className="flex w-full">
          {headerGroup.headers
            .filter(header => header.column.getIsVisible())
            .map(header => {
              const isResizing = header.column.getIsResizing();
              const isLast = header.column.getIsLastColumn();
              const { minSize, maxSize } = header.column.columnDef;
              const enableResizeHandler =
                minSize !== undefined && maxSize !== undefined
                  ? minSize !== maxSize
                  : true;

              const columnId = header.column.id;

              return (
                <div
                  key={header.id}
                  data-column-id={columnId}
                  data-resizing={isResizing}
                  className={cn(
                    "group/header relative flex cursor-pointer items-center text-left",
                    "h-8 @sm/lens-table:h-9 @md/lens-table:h-10 @lg/lens-table:h-10",
                    "px-1 @sm/lens-table:px-1 @md/lens-table:px-1.5 @lg/lens-table:px-2",
                    "text-xs @sm/lens-table:text-xs @md/lens-table:text-xs @lg/lens-table:text-sm",
                    "text-foreground font-medium",
                    "bg-muted transition-colors duration-200",
                    "group-data-[resizing=false]:hover:bg-muted/60",
                    "hover:shadow-sm",
                    isResizing && "bg-muted/50"
                  )}
                  style={{
                    width: `calc(var(--header-${header.id}-size) * 1px)`,
                  }}
                >
                  <HeaderContextMenu attribute={columnId}>
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      <SortableHeaderCell columnId={columnId} />
                    </div>
                  </HeaderContextMenu>
                  <ResizeHandle
                    header={header as Header<unknown, unknown>}
                    isResizing={isResizing}
                    disabled={!enableResizeHandler}
                    isLast={isLast}
                  />
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};
