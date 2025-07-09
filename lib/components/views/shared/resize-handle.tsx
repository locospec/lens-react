import type { Header } from "@tanstack/react-table";
import { cn } from "@lens2/shadcn/lib/utils";

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
        "absolute right-0 top-0 z-20 flex h-full w-1 touch-none select-none items-center justify-end",
        disabled ? "cursor-not-allowed" : "cursor-ew-resize"
      )}
      data-isresizing={isResizing ? "true" : "false"}
      data-islast={isLast ? "true" : "false"}
    >
      <div
        className={cn(
          disabled ? "hidden" : "opacity-100",
          "h-1/2 w-0.5 rounded-l-md bg-gray-300 transition-all duration-200 ease-in-out",
          "hover:h-3/4 hover:w-1 hover:bg-gray-600",
          "dark:bg-gray-500 dark:hover:bg-gray-300",
          isResizing && "h-3/4 w-1 bg-gray-700 dark:bg-gray-300",
        )}
      />
    </div>
  );
};