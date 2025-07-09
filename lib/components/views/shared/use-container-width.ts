import { useState, useCallback, useLayoutEffect } from "react";
import { useResizeObserver } from "./use-resize-observer";

export function useContainerWidth(wrapperRef: React.RefObject<HTMLDivElement | null>) {
  const [containerWidth, setContainerWidth] = useState(0);

  // Use ResizeObserver for subsequent updates
  useResizeObserver(
    wrapperRef,
    useCallback((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    }, [])
  );

  // Also measure immediately when the ref is attached
  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const width = wrapperRef.current.getBoundingClientRect().width;
      setContainerWidth(width);
    }
  }, [wrapperRef]);

  return containerWidth;
}