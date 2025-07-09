import { useRef } from "react";
import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useInfiniteFetch } from "@lens2/hooks/use-infinite-fetch";
import { useFetchMoreOnScroll } from "@lens2/hooks/use-fetch-more-on-scroll";

export function RawDisplay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, endpoints, headers } = useLensContext();
  const { view, readPayload } = useViewContext();

  const {
    flatData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    totalCount,
  } = useInfiniteFetch({
    query: query,
    viewId: view.id,
    endpoint: endpoints.query,
    headers: headers,
    perPage: 5, // Changed to 5 as requested
    body: readPayload,
  });

  const { fetchMoreOnBottomReached } = useFetchMoreOnScroll({
    containerRef,
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
        <h3 className="text-lg font-semibold">{query}</h3>
        <div className="text-sm text-gray-600">
          {flatData.length} records
          {totalCount && ` of ${totalCount}`}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
        onScroll={e => {
          fetchMoreOnBottomReached(e.target as HTMLDivElement);
        }}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            {flatData.map((item: any, index: number) => (
              <div
                key={item.id || index}
                className="mb-1 p-2 bg-gray-50 rounded border text-xs font-mono whitespace-nowrap overflow-x-auto"
              >
                <span className="font-bold text-gray-600 mr-2">
                  {index + 1}.
                </span>
                {JSON.stringify(item)}
              </div>
            ))}

            {isFetching && !isLoading && (
              <div className="text-center py-2 text-sm">Loading more...</div>
            )}

            {!hasNextPage && flatData.length > 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                No more data
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
