/**
 * Lens component types
 */

import type { AttributeDisplayConfiguration } from "./attributes";
import type { LensConfiguration, LensDataProps } from "./config";
import type { SelectionConfiguration } from "./interactions";
import type { ViewConfiguration } from "./view";

// Component props extend the core data props and all configurations
export interface LensProps
  extends LensDataProps,
    LensConfiguration,
    ViewConfiguration,
    AttributeDisplayConfiguration,
    SelectionConfiguration {
  onError?: (error: Error) => void;
  enableDebug?: boolean;
}

// LensContent component props
export interface LensContentProps {
  onError?: (error: Error) => void;
}
