import { Paginator } from "@lens2/components/paginator";
import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import { FETCH_CONFIG } from "@lens2/views/shared/constants";
import { useRef } from "react";

export function RawDisplay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    query,
    endpoints,
    headers,
    perPage: contextPerPage,
    paginationType,
  } = useLensContext();
  const { view, readPayload } = useViewContext();

  const {
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    totalCount,
    currentPage,
    totalPages,
  } = useInfiniteFetch({
    query: query,
    viewId: view.id,
    endpoint: endpoints.query,
    headers: headers,
    perPage: contextPerPage || FETCH_CONFIG.DEFAULT_PER_PAGE,
    paginationType: paginationType,
    body: readPayload,
  });

  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  return (
    <div className="flex h-full flex-col">
      <Paginator
        loadedCount={flatData.length}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={contextPerPage || FETCH_CONFIG.DEFAULT_PER_PAGE}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-y-auto p-4"
        onScroll={e => {
          fetchMoreOnBottomReached(e.target as HTMLDivElement);
        }}
      >
        {isLoading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : (
          <>
            {flatData.map((item, index: number) => (
              <div
                key={item.id || index}
                className="mb-1 overflow-x-auto rounded border bg-gray-50 p-2 font-mono text-xs whitespace-nowrap"
              >
                <span className="mr-2 font-bold text-gray-600">
                  {index + 1}.
                </span>
                {JSON.stringify(item)}
              </div>
            ))}

            {isFetching && !isLoading && (
              <div className="py-2 text-center text-sm">Loading more...</div>
            )}

            {!hasNextPage && flatData.length > 0 && (
              <div className="py-2 text-center text-sm text-gray-500">
                No more data
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
