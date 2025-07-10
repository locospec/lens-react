import React from "react";
import { ViewConfigSheet } from "./view-config-sheet";

interface ViewConfigurationProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export function ViewConfiguration({ containerRef }: ViewConfigurationProps) {
  return <ViewConfigSheet containerRef={containerRef} />;
}
