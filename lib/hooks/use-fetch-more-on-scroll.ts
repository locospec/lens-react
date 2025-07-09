import { useCallback, useEffect } from "react";

const DEFAULT_OFFSET = 200;

interface UseFetchMoreOnScrollInterface {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
  offset?: number;
}

const useFetchMoreOnScroll = ({
  containerRef, // Used by caller to pass the element on scroll events
  fetchNextPage,
  isFetching,
  hasNextPage,
  offset = DEFAULT_OFFSET,
}: UseFetchMoreOnScrollInterface) => {
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        const isHidden =
          scrollHeight === 0 && scrollTop === 0 && clientHeight === 0;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        if (
          !isHidden &&
          distanceFromBottom < offset &&
          !isFetching &&
          hasNextPage
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, hasNextPage, offset]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached]);

  return { fetchMoreOnBottomReached };
};

useFetchMoreOnScroll.displayName = "useFetchMoreOnScroll";

export { useFetchMoreOnScroll };
