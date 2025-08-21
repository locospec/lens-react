import { cn } from "@lens2/shadcn/lib/utils";

interface TableSkeletonProps {
  rows: number;
  columns: number;
  className?: string;
}

// Simple skeleton component
const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("bg-muted/50 animate-pulse rounded-md", className)}
      {...props}
    />
  );
};

export const TableSkeleton = ({
  rows,
  columns,
  className,
}: TableSkeletonProps) => {
  return (
    <div className={cn("w-full", className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className="border-border flex w-full border-b"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className={cn(
                "flex flex-1 items-center overflow-hidden",
                "px-1 @sm/lens-table:px-1 @md/lens-table:px-1.5 @lg/lens-table:px-2",
                "py-1.5 @sm/lens-table:py-2 @md/lens-table:py-2.5 @lg/lens-table:py-2.5"
              )}
            >
              <Skeleton
                className={cn(
                  "h-4",
                  // Vary skeleton widths for more natural look
                  colIndex === 0
                    ? "w-3/4"
                    : colIndex === columns - 1
                      ? "w-1/2"
                      : "w-full"
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
