import { cn } from "@lens2/shadcn/lib/utils";
import type { Header } from "@tanstack/react-table";

export interface ResizeHandleProps {
  header: Header<any, unknown>;
  isResizing: boolean;
  disabled?: boolean;
  isLast?: boolean;
}

export const ResizeHandle = ({
  header,
  isResizing,
  disabled = false,
  isLast = false,
}: ResizeHandleProps) => {
  const resizeHandler = header.getResizeHandler();

  return (
    <div
      onDoubleClick={() => {
        // For now, just reset to default size
        // Auto-sizing based on content would require access to the table instance
        // and its onColumnSizingChange handler
        header.column.resetSize();
      }}
      onMouseDown={resizeHandler}
      onTouchStart={resizeHandler}
      className={cn(
        "absolute top-0 right-0 z-20 h-full w-1 touch-none select-none",
        "group/resize-handle",
        disabled ? "cursor-not-allowed" : "cursor-ew-resize"
      )}
      data-isresizing={isResizing ? "true" : "false"}
      data-islast={isLast ? "true" : "false"}
    >
      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-0.5 rounded-l-md bg-gray-300 transition-all duration-200 ease-in-out",
          // Hidden by default
          disabled ? "hidden" : "opacity-0",
          // Visible on column header hover (but not when any column is resizing)
          "group-data-[resizing=false]:group-hover/header:opacity-100",
          // Hover effects on the handle itself
          "group-hover/resize-handle:h-3/4 group-hover/resize-handle:w-1 group-hover/resize-handle:bg-gray-600",
          "dark:bg-gray-500 dark:group-hover/resize-handle:bg-gray-300",
          // When resizing
          isResizing && "opacity-100 h-3/4 w-1 bg-gray-700 dark:bg-gray-300"
        )}
      />
    </div>
  );
};
