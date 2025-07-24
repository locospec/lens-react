/**
 * Lens component types
 */

import type { Json } from "./common";
import type { LensDataProps } from "./config";
import type { View, ViewScoping } from "./view";
import type { EntityInteractions } from "./interactions";
import type { DisplayAttribute } from "./attributes";

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
  interactions?: EntityInteractions;
  // Cache configuration
  cacheTime?: number; // Cache duration in milliseconds (default: 30 minutes)
  enablePersistentCache?: boolean; // Enable localStorage/IndexedDB persistence (default: true)
  enableForceRefresh?: boolean; // Show refresh button to clear cache (default: false)
  onRefresh?: () => void; // Callback when cache is cleared
  // View configuration
  initialViewId?: string; // Initial view ID to load
  onViewChange?: (viewId: string) => void; // Callback when view changes
  // Attribute display configuration
  displayAttributes?: DisplayAttribute[]; // Explicitly define which attributes to show and their labels
  hideAttributes?: string[]; // Hide specific attributes from display
  // System views configuration
  systemViews?: View[]; // Pre-configured views provided by developers
}

// LensContent component props
export interface LensContentProps {
  onError?: (error: Error) => void;
}
