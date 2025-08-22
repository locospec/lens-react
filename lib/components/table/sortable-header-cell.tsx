import { useTableSorting } from "@lens2/hooks/use-table-sorting";
import { cn } from "@lens2/shadcn/lib/utils";
import type { SortDirection } from "@lens2/types/view";
import * as logger from "@lens2/utils/logger";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface SortIndicatorProps {
  isSorted: boolean;
  direction: SortDirection | null;
  position: number; // Position in multi-sort order (-1 if not sorted)
  className?: string;
}

function SortIndicator({
  isSorted,
  direction,
  position,
  className,
}: SortIndicatorProps) {
  const getSortIcon = () => {
    if (isSorted) {
      // Show actual sort direction
      if (direction === "asc") {
        return (
          <div className="flex flex-col items-center">
            <ChevronUp className="text-foreground h-4 w-4" />
            <div className="text-foreground transform text-[6px]">ASC</div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center">
            <ChevronDown className="text-foreground h-4 w-4" />
            <div className="text-foreground transform text-[6px]">DESC</div>
          </div>
        );
      }
    }

    // Show neutral sort icon (will be shown/hidden via CSS opacity)
    return <ArrowUpDown className="text-muted-foreground h-3 w-3" />;
  };

  const showPosition = isSorted && position >= 0;

  return (
    <div
      className={cn(
        "ml-1 flex items-center gap-1 transition-all duration-200",
        className
      )}
    >
      {getSortIcon()}
      {showPosition && (
        <span
          className={cn(
            "min-w-[16px] rounded-sm px-1 py-0.5 text-center text-xs font-medium",
            "bg-primary/10 text-primary border-primary/20 border",
            "transition-all duration-200"
          )}
        >
          {position + 1}
        </span>
      )}
    </div>
  );
}

interface SortableHeaderCellProps {
  columnId: string;
}

export function SortableHeaderCell({ columnId }: SortableHeaderCellProps) {
  const { handleSortToggle, getSortStateForColumn, isColumnSortable } =
    useTableSorting();

  const sortState = getSortStateForColumn(columnId);
  const isSortable = isColumnSortable(columnId);

  if (!isSortable) {
    return null;
  }

  return (
    <div
      className={cn(
        "group/sort-handle",
        // Hidden by default, shown on header hover
        "opacity-0 transition-opacity duration-200",
        "group-hover/header:opacity-100",
        // Sort icon styling
        "hover:bg-accent/50 cursor-pointer rounded-sm p-1",
        // Always visible if sorted
        sortState.isSorted && "opacity-100"
      )}
      onClick={e => {
        logger.debug("Sort icon clicked", {
          columnId,
          event: e.type,
          isSortable,
        });
        e.stopPropagation();
        handleSortToggle(columnId);
      }}
    >
      <SortIndicator
        isSorted={sortState.isSorted}
        direction={sortState.direction}
        position={sortState.position}
      />
    </div>
  );
}
