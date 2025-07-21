/**
 * Lens component types
 */

import type { Json } from "./common";
import type { LensDataProps } from "./config";
import type { ViewScoping } from "./view";

// Filter type options
export type FilterType = "advanced" | "chip";

// Component props extend the core data props
export interface LensProps extends LensDataProps {
  onError?: (error: Error) => void;
  enableDebug?: boolean;
  globalContext?: Record<string, Json>;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
  filterType?: FilterType;
}

// LensContent component props
export interface LensContentProps {
  onError?: (error: Error) => void;
}
