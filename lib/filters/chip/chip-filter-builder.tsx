import { useLensContext } from "@lens2/contexts/lens-context";
import { OptionsCacheProvider } from "@lens2/contexts/options-cache-context";
import { useViewContext } from "@lens2/contexts/view-context";
import {
  applyChipFilters,
  lensFilterToChipFilters,
} from "@lens2/filters/logic/chip-filter-logic";
import * as logger from "@lens2/utils/logger";
import { useCallback, useEffect, useState } from "react";
import { ChipFilterCreator } from "./chip-filter-creator";
import { ChipFilterList } from "./chip-filter-list";
import { ChipFilter } from "./types";

interface ChipFilterBuilderProps {
  className?: string;
}

export function ChipFilterBuilder({ className }: ChipFilterBuilderProps) {
  const { filters: contextFilters, setFilters } = useViewContext();
  const [allFilters, setAllFilters] = useState<ChipFilter[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Initialize filters from context on mount
  useEffect(() => {
    if (contextFilters && Object.keys(contextFilters).length > 0) {
      const chipFilters = lensFilterToChipFilters(contextFilters);
      setAllFilters(chipFilters);
    }
    // We only want to run this on mount, not when contextFilters changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update view filters using logic layer
  const updateViewFilters = useCallback(
    (chipFilters: ChipFilter[]) => {
      // Remove sessionId before applying to view
      const cleanFilters = chipFilters.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ sessionId, ...filter }) => filter
      );
      applyChipFilters(cleanFilters, setFilters);
    },
    [setFilters]
  );

  // Start a new session
  const handleSessionStart = useCallback(() => {
    const sessionId = `session-${Date.now()}`;
    setCurrentSessionId(sessionId);
    return sessionId;
  }, []);

  // End the current session
  const handleSessionEnd = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  // Handle filter updates from creator
  const handleFilterUpdate = useCallback(
    (attribute: string, value: unknown, operator: string) => {
      if (!currentSessionId) {
        logger.error("No active session for filter update");
        return;
      }

      setAllFilters(prevFilters => {
        // Check if we have a filter for this attribute in the current session
        const existingFilterIndex = prevFilters.findIndex(
          f => f.attribute === attribute && f.sessionId === currentSessionId
        );

        if (value === "" || value === null || value === undefined) {
          // Remove the filter if value is empty
          if (existingFilterIndex !== -1) {
            const newFilters = prevFilters.filter(
              (_, index) => index !== existingFilterIndex
            );
            updateViewFilters(newFilters);
            return newFilters;
          }
          return prevFilters;
        }

        // Create or update the filter
        const newFilter: ChipFilter = {
          id:
            existingFilterIndex !== -1
              ? prevFilters[existingFilterIndex].id
              : `chip-${attribute}-${Date.now()}`,
          attribute,
          operator,
          value,
          sessionId: currentSessionId,
        };

        let newFilters: ChipFilter[];
        if (existingFilterIndex !== -1) {
          // Update existing filter
          newFilters = [...prevFilters];
          newFilters[existingFilterIndex] = newFilter;
        } else {
          // Add new filter
          newFilters = [...prevFilters, newFilter];
        }

        updateViewFilters(newFilters);
        return newFilters;
      });
    },
    [currentSessionId, updateViewFilters]
  );

  // Update an existing filter (from chip list)
  const handleFilterListUpdate = useCallback(
    (updatedFilter: ChipFilter) => {
      setAllFilters(prevFilters => {
        const newFilters = prevFilters.map(filter =>
          filter.id === updatedFilter.id ? updatedFilter : filter
        );
        updateViewFilters(newFilters);
        return newFilters;
      });
    },
    [updateViewFilters]
  );

  // Remove a filter
  const handleFilterRemove = useCallback(
    (filterId: string) => {
      setAllFilters(prevFilters => {
        const newFilters = prevFilters.filter(filter => filter.id !== filterId);
        updateViewFilters(newFilters);
        return newFilters;
      });
    },
    [updateViewFilters]
  );

  // Get attribute configurations from lens context
  const { attributes: contextAttributes } = useLensContext();

  const getAttribute = useCallback(
    (attributeKey: string) => {
      return contextAttributes[attributeKey];
    },
    [contextAttributes]
  );

  // Get filters for the current session
  const getSessionFilters = useCallback(() => {
    if (!currentSessionId) return new Map<string, ChipFilter>();

    const sessionFilters = new Map<string, ChipFilter>();
    allFilters.forEach(filter => {
      if (filter.sessionId === currentSessionId) {
        sessionFilters.set(filter.attribute, filter);
      }
    });
    return sessionFilters;
  }, [currentSessionId, allFilters]);

  return (
    <OptionsCacheProvider>
      <div className={className}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter creator button - always on the left */}
          <ChipFilterCreator
            onSessionStart={handleSessionStart}
            onSessionEnd={handleSessionEnd}
            onFilterUpdate={handleFilterUpdate}
            sessionFilters={getSessionFilters()}
          />

          {/* Filter chips list - to the right of creator */}
          <ChipFilterList
            filters={allFilters}
            onFilterUpdate={handleFilterListUpdate}
            onFilterRemove={handleFilterRemove}
            getAttribute={getAttribute}
          />
        </div>
      </div>
    </OptionsCacheProvider>
  );
}
