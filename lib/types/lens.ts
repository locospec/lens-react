/**
 * Lens component types
 */

import type { Json } from "./common";
import type { LensDataProps } from "./config";
import type { ViewScoping } from "./view";

// Component props extend the core data props
export interface LensProps extends LensDataProps {
  onError?: (error: Error) => void;
  enableDebug?: boolean;
  globalContext?: Record<string, Json>;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
}

// LensContent component props
export interface LensContentProps {
  onError?: (error: Error) => void;
}
