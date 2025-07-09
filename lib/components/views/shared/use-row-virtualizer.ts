import { useVirtualizer } from "@tanstack/react-virtual";
import { RefObject } from "react";
import { ROW_CONFIG } from "./constants";

interface UseRowVirtualizerProps {
  rowCount: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useRowVirtualizer({
  rowCount,
  containerRef,
}: UseRowVirtualizerProps) {
  return useVirtualizer({
    count: rowCount,
    estimateSize: () => ROW_CONFIG.ESTIMATED_HEIGHT,
    getScrollElement: () => containerRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
    overscan: ROW_CONFIG.OVERSCAN_COUNT,
  });
}
