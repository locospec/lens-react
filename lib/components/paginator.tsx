import { useLensContext } from "@lens2/contexts/lens-context";
import type { PaginationType } from "@lens2/types/pagination";
import { CheckCircle, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface PaginatorProps {
  // Data info
  loadedCount: number;
  totalCount?: number | null;

  // Current page info (for offset pagination)
  currentPage?: number;
  totalPages?: number;
  perPage?: number;

  // Loading states
  hasNextPage?: boolean;
  isFetching?: boolean;

  // Type override (optional, defaults to context)
  paginationType?: PaginationType;
}

export function Paginator({
  loadedCount,
  totalCount,
  currentPage = 1,
  totalPages = 1,
  perPage = 20,
  hasNextPage = false,
  isFetching = false,
  paginationType: propPaginationType,
}: PaginatorProps) {
  const { paginationType: contextPaginationType } = useLensContext();
  const paginationType =
    propPaginationType || contextPaginationType || "cursor";

  // Calculate progress for offset pagination
  const progressData = useMemo(() => {
    if (paginationType !== "offset" || !totalCount) return null;

    const recordsProgress =
      totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;
    const pagesProgress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;
    const isAllLoaded =
      !hasNextPage && totalCount > 0 && loadedCount >= totalCount;

    return {
      recordsProgress,
      pagesProgress,
      isAllLoaded,
    };
  }, [
    paginationType,
    totalCount,
    loadedCount,
    currentPage,
    totalPages,
    hasNextPage,
  ]);

  // Progress Circle Component
  const ProgressCircle = ({ progress }: { progress: number }) => (
    <div className="relative h-3 w-3">
      <svg className="h-3 w-3 -rotate-90 transform" viewBox="0 0 16 16">
        {/* Background circle */}
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-blue-500"
          strokeDasharray={`${2 * Math.PI * 6}`}
          strokeDashoffset={`${2 * Math.PI * 6 * (1 - progress / 100)}`}
          style={{
            transition: "stroke-dashoffset 0.3s ease-in-out",
          }}
        />
      </svg>
    </div>
  );

  // Get status icon
  const getStatusIcon = () => {
    if (isFetching) {
      return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
    }

    if (paginationType === "cursor") {
      // For cursor pagination, only show completion icon when all loaded
      return hasNextPage ? null : (
        <CheckCircle className="h-3 w-3 text-green-500" />
      );
    } else {
      // For offset pagination, show progress or completion
      return progressData?.isAllLoaded ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <ProgressCircle progress={progressData?.recordsProgress || 0} />
      );
    }
  };

  // Render cursor pagination display
  if (paginationType === "cursor") {
    return (
      <div className="flex items-center justify-end gap-3 bg-gray-50/50 px-4 py-2.5">
        {getStatusIcon()}
        <div className="text-sm font-medium text-gray-600">
          {loadedCount} records loaded • {perPage} per page
        </div>
      </div>
    );
  }

  // Render offset pagination display
  const total = totalCount || 0;

  return (
    <div className="flex items-center justify-end gap-3 bg-gray-50/50 px-4 py-2.5">
      {getStatusIcon()}
      <div className="text-sm font-medium text-gray-600">
        {loadedCount}/{total} records • {currentPage}/{totalPages} pages •{" "}
        {perPage} per page
        {progressData && (
          <span className="ml-2 text-xs text-gray-500">
            ({Math.round(progressData.recordsProgress)}%)
          </span>
        )}
      </div>
    </div>
  );
}
