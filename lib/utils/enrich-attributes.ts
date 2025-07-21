import { getDefaultOperator } from "@lens2/filters/logic/filter-operators-config";
import type { AggregateDefinition } from "@lens2/types/api";
import type { Attribute } from "@lens2/types/attributes";

/**
 * Enrich attributes from backend with aggregator-aware properties
 *
 * This function takes attributes from the backend and adds computed properties
 * based on aggregator definitions, specifically:
 * - filterAttribute: The actual field to use for filtering (from aggregator's groupBy)
 * - aggregatorKeys: Mapping of response fields (valueKey, labelKey, countKey)
 */
export function enrichAttributes(
  attributes: Record<string, Attribute>,
  aggregates: Record<string, AggregateDefinition> = {}
): Record<string, Attribute> {
  const enriched: Record<string, Attribute> = {};

  Object.entries(attributes).forEach(([key, attr]) => {
    const optionsAggregator = attr.optionsAggregator;

    // Default values
    let filterAttribute = attr.filterAttribute || key;
    let aggregatorKeys = attr.aggregatorKeys;

    // If this attribute uses an aggregator, compute additional properties
    if (optionsAggregator && aggregates[optionsAggregator]) {
      const aggregatorDef = aggregates[optionsAggregator];

      // Get the correct filter attribute from aggregator's first groupBy
      if (aggregatorDef.groupBy && aggregatorDef.groupBy.length > 0) {
        filterAttribute = aggregatorDef.groupBy[0].source;
      }

      // Determine the keys used in aggregator responses
      aggregatorKeys = {
        valueKey: aggregatorDef.groupBy?.[0]?.name || "id",
        labelKey:
          aggregatorDef.groupBy?.[1]?.name ||
          aggregatorDef.groupBy?.[0]?.name ||
          "name",
        countKey:
          aggregatorDef.columns?.find(
            (col: { function: string; name: string }) =>
              col.function === "count"
          )?.name || "count",
      };
    }

    // If attribute has optionsAggregator, treat it as enum type
    const effectiveType = optionsAggregator ? "enum" : attr.type;

    // Get default operator for this attribute type
    const defaultOperator = getDefaultOperator(effectiveType);

    // Return enriched attribute
    enriched[key] = {
      ...attr,
      type: effectiveType,
      filterAttribute,
      aggregatorKeys,
      defaultOperator,
    };
  });

  return enriched;
}
