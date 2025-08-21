import { getDefaultOperator } from "@lens2/filters/logic/filter-operators-config";
import {
  FILTERABLE_ATTRIBUTE_TYPES,
  SEARCHABLE_ATTRIBUTE_TYPES,
  SORTABLE_ATTRIBUTE_TYPES,
  SUPPORTED_ATTRIBUTE_TYPES,
} from "@lens2/filters/logic/operators";
import type { AggregateDefinition } from "@lens2/types/api";
import type { Attribute, DisplayAttribute } from "@lens2/types/attributes";
import * as logger from "@lens2/utils/logger";

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
  aggregates: Record<string, AggregateDefinition> = {},
  displayAttributes?: DisplayAttribute[],
  hideAttributes?: string[]
): Record<string, Attribute> {
  const enriched: Record<string, Attribute> = {};

  // Determine which attributes to process
  let attributesToProcess: Array<[string, Attribute]>;

  if (displayAttributes) {
    // If displayAttributes is provided, only include those (in that order)
    attributesToProcess = [];
    displayAttributes.forEach(displayAttr => {
      const attr = attributes[displayAttr.attribute];
      if (attr) {
        // Apply custom label if provided
        const enrichedAttr = displayAttr.label
          ? { ...attr, label: displayAttr.label }
          : attr;
        attributesToProcess.push([displayAttr.attribute, enrichedAttr]);
      }
    });
  } else {
    // Otherwise use all attributes
    attributesToProcess = Object.entries(attributes);

    // Apply hideAttributes filter if provided
    if (hideAttributes && hideAttributes.length > 0) {
      attributesToProcess = attributesToProcess.filter(
        ([key]) => !hideAttributes.includes(key)
      );
    }
  }

  attributesToProcess.forEach(([key, attr]) => {
    // Skip unsupported attribute types
    if (!SUPPORTED_ATTRIBUTE_TYPES.includes(attr.type)) {
      logger.warn(
        `Skipping attribute "${key}" with unsupported type: ${attr.type}`
      );
      return;
    }
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
    let defaultOperator: string;
    try {
      defaultOperator = getDefaultOperator(effectiveType);
    } catch (error) {
      logger.warn(
        `Could not get default operator for type ${effectiveType}, skipping attribute "${key}"`
      );
      return;
    }

    // Compute searchable, filterable, and sortable based on the effective (final) type
    const isFilterable = FILTERABLE_ATTRIBUTE_TYPES.includes(effectiveType);
    const isSearchable = SEARCHABLE_ATTRIBUTE_TYPES.includes(effectiveType);
    const isSortable = SORTABLE_ATTRIBUTE_TYPES.includes(effectiveType);

    // Return enriched attribute
    enriched[key] = {
      ...attr,
      type: effectiveType,
      filterAttribute,
      aggregatorKeys,
      defaultOperator,
      filterable: isFilterable,
      searchable: isSearchable,
      sortable: isSortable,
    };
  });

  logger.debug("Enriched attributes", enriched);

  return enriched;
}
