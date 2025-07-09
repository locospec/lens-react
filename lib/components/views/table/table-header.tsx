import { ResizeHandle } from "@lens2/components/views/shared/resize-handle";
import { cn } from "@lens2/shadcn/lib/utils";
import { Table, flexRender } from "@tanstack/react-table";

interface TableHeaderProps {
  table: Table<any>;
}

export const TableHeader = ({ table }: TableHeaderProps) => {
  return (
    <div className="bg-background sticky top-0 z-10 flex">
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
                    "relative flex items-center text-left",
                    "@sm/lens-table:h-8 @md/lens-table:h-9 @lg/lens-table:h-10",
                    "@sm/lens-table:px-1 @md/lens-table:px-1.5 @lg/lens-table:px-2",
                    "@sm/lens-table:text-xs @md/lens-table:text-xs @lg/lens-table:text-sm",
                    "text-foreground font-medium",
                    "bg-muted transition-colors",
                    "group-data-[resizing=false]:hover:bg-muted/80"
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
