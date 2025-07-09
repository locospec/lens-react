import { useEffect } from "react";

export interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[]): void;
}

export function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: ResizeObserverCallback
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(callback);
    resizeObserver.observe(element);
    
    return () => resizeObserver.disconnect();
  }); // Run on every render to catch when ref.current changes
}