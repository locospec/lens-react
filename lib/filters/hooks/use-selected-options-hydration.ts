import { useLensContext } from "@lens2/contexts/lens-context";
import { useOptionsCache } from "@lens2/contexts/options-cache-context";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseSelectedOptionsHydrationParams {
  attribute: string;
  selectedIds: string[];
  onHydrated?: (options: Array<{ value: string; label: string }>) => void;
}

export const useSelectedOptionsHydration = ({
  attribute,
  selectedIds,
  onHydrated,
}: UseSelectedOptionsHydrationParams) => {
  const { baseUrl, headers, globalContext, query, attributes } =
    useLensContext();
  const { getOption, setOption } = useOptionsCache();

  // Get the correct attribute config
  const attributeConfig = attributes[attribute];
  const filterAttribute = attributeConfig?.filterAttribute || attribute;
  const keys = attributeConfig?.aggregatorKeys;

  // Check which IDs need hydration
  const { cachedOptions, idsNeedingHydration } = useMemo(() => {
    const cached = new Map<string, string>();
    const needHydration: string[] = [];

    selectedIds.forEach(id => {
      const cachedLabel = getOption(attribute, id);
      if (cachedLabel) {
        cached.set(id, cachedLabel);
      } else {
        needHydration.push(id);
      }
    });

    return { cachedOptions: cached, idsNeedingHydration: needHydration };
  }, [selectedIds, attribute, getOption]);

  // Create a stable query key based on the request parameters
  const queryKey = useMemo(
    () => [
      "hydrate-options",
      query,
      attribute,
      {
        globalContext,
        idsNeedingHydration: idsNeedingHydration.sort(), // Sort for consistent key
      },
    ],
    [query, attribute, globalContext, idsNeedingHydration]
  );

  // Use React Query to fetch missing options
  const { data: fetchedOptions, isLoading: isHydrating } = useQuery({
    queryKey,
    queryFn: async () => {
      // If no IDs need hydration, return empty map
      if (idsNeedingHydration.length === 0) {
        return new Map<string, string>();
      }

      if (!keys) {
        console.error(`Missing aggregatorKeys for attribute: ${attribute}`);
        return new Map<string, string>();
      }

      const response = await fetch(`${baseUrl}/${query}/_aggregate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          globalContext: globalContext || {},
          options: attribute,
          filters: {
            op: "and",
            conditions: [
              {
                attribute: filterAttribute,
                op: "is_any_of",
                value: idsNeedingHydration,
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to hydrate options: ${response.statusText}`);
      }

      const result = await response.json();
      const optionsMap = new Map<string, string>();

      result.data?.forEach((item: Record<string, unknown>) => {
        const value = String(item[keys.valueKey] || "");
        const label = String(item[keys.labelKey] || value);

        if (value) {
          optionsMap.set(value, label);
          // Cache the fetched option
          setOption(attribute, value, label);
        }
      });

      return optionsMap;
    },
    enabled: idsNeedingHydration.length > 0,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Merge cached and fetched options
  const hydratedOptions = useMemo(() => {
    const merged = new Map(cachedOptions);
    if (fetchedOptions) {
      fetchedOptions.forEach((label, value) => {
        merged.set(value, label);
      });
    }
    return merged;
  }, [cachedOptions, fetchedOptions]);

  // Notify parent when hydration is complete
  useMemo(() => {
    if (onHydrated && !isHydrating && selectedIds.length > 0) {
      const options = Array.from(hydratedOptions.entries()).map(
        ([value, label]) => ({
          value,
          label,
        })
      );
      onHydrated(options);
    }
  }, [hydratedOptions, isHydrating, onHydrated, selectedIds.length]);

  return { hydratedOptions, isHydrating };
};
