import { cn } from "@lens2/shadcn/lib/utils";
import type { RowData } from "@lens2/types/common";
import { ResizeHandle } from "@lens2/views/shared/resize-handle";
import { Table, flexRender } from "@tanstack/react-table";

interface TableHeaderProps {
  table: Table<RowData>;
}

export const TableHeader = ({ table }: TableHeaderProps) => {
  return (
    <div className="bg-background sticky top-0 z-10 flex border-b">
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

              return (
                <div
                  key={header.id}
                  data-column-id={header.column.id}
                  className={cn(
                    "relative flex items-center text-left font-medium",
                    "@sm/lens-view-table:h-8 @md/lens-view-table:h-9 @lg/lens-view-table:h-10",
                    "@sm/lens-view-table:px-1 @md/lens-view-table:px-1.5 @lg/lens-view-table:px-2",
                    "@sm/lens-view-table:text-xs @md/lens-view-table:text-xs @lg/lens-view-table:text-sm",
                    "text-foreground bg-gray-50 transition-colors",
                    "dark:bg-gray-900",
                    "group-data-[resizing=false]:hover:bg-gray-100 dark:group-data-[resizing=false]:hover:bg-gray-800"
                  )}
                  style={{
                    width: `calc(var(--header-${header.id}-size) * 1px)`,
                  }}
                >
                  <span className="truncate">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </span>
                  <ResizeHandle
                    header={header}
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
