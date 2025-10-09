import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { useCallback, useEffect, useState } from "react";

/**
 * Check if a field in the schema is an API field that needs refetch
 * Only considers fields that are explicitly configured as API fields in the schema
 */
function isApiFieldInSchema(field: any): boolean {
  // Primary indicator: has relatedModelName (explicitly configured as API field)
  if (field.relatedModelName) {
    console.log(`Field has relatedModelName: ${field.relatedModelName}`);
    return true;
  }

  return false;
}

/**
 * Process schema data in a single pass - filter data and detect API fields
 * This is more efficient than doing two separate traversals
 */
function processSchemaData(
  itemData: Record<string, any>,
  schema: any
): { filteredData: Record<string, any>; apiFields: string[] } {
  if (!schema?.properties || !itemData)
    return { filteredData: {}, apiFields: [] };

  const apiFields: string[] = [];

  // Recursively process schema properties in a single pass
  function processProperties(
    properties: any,
    data: any,
    prefix = ""
  ): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const dataValue = getNestedValue(data, fieldPath);

      if (value.type === "object" && value.properties) {
        // Nested object - recurse
        if (dataValue && typeof dataValue === "object") {
          const nestedProcessed = processProperties(
            value.properties,
            data,
            fieldPath
          );
          if (Object.keys(nestedProcessed).length > 0) {
            result[key] = nestedProcessed;
          }
        }
      } else {
        // Leaf field - include if it has a value
        if (dataValue !== null && dataValue !== undefined) {
          result[key] = dataValue;

          // Check if this is an API field that needs refetch
          if (isApiFieldInSchema(value)) {
            console.log(
              `Found API field in schema: ${fieldPath} with value:`,
              dataValue
            );
            console.log(`Field config:`, value);
            apiFields.push(fieldPath);
          }
        }
      }
    });

    return result;
  }

  const filteredData = processProperties(schema.properties, itemData);

  console.log("Schema processing - Found API fields:", apiFields);
  console.log("Schema processing - Filtered data:", filteredData);

  return { filteredData, apiFields };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string) {
  if (!obj || !path) return null;
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export interface UseInitialDataFetchParams {
  primaryKey?: string;
  model?: string;
  enabled?: boolean;
  schema?: any;
}

/**
 * Hook to fetch initial data for update forms
 * This is used when a primary key is provided in the global context
 */
export function useInitialDataFetch({
  primaryKey,
  model,
  enabled = true,
  schema,
}: UseInitialDataFetchParams) {
  const { baseUrl, headers, setFormData, triggerFieldRefetch, globalContext } =
    useLensFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!primaryKey || !model || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `Fetching initial data for ${model} with ID:`,
        primaryKey,
        globalContext.primaryKeyValue,
        globalContext
      );

      const response = await fetch(`${baseUrl}/${model}/_read`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: {
            op: "and",
            conditions: [
              {
                attribute: primaryKey, // Use the primary key field from config
                op: "is",
                value: globalContext.primaryKeyValue,
              },
            ],
          },
          disableTransform: ["*"],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const responseData = await response.json();
      const itemData = responseData.data?.[0];

      if (itemData) {
        console.log("Fetched initial data:", itemData);

        // Process schema data and detect API fields in a single pass
        const { filteredData, apiFields } = processSchemaData(itemData, schema);
        setFormData(filteredData);

        console.log("Schema processing - Found API fields:", apiFields);
        console.log("Schema properties:", schema?.properties);
        console.log("Original item data keys:", Object.keys(itemData));
        console.log("Filtered form data keys:", Object.keys(filteredData));

        apiFields.forEach(fieldPath => {
          const value = itemData[fieldPath];
          if (value) {
            console.log(
              `Triggering refetch for schema field: ${fieldPath} with value:`,
              value
            );
            triggerFieldRefetch(fieldPath, value);
          } else {
            console.log(`Skipping field ${fieldPath} - no value in itemData`);
          }
        });
      } else {
        throw new Error("No data found for the provided ID");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      console.error("Error fetching initial data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    primaryKey,
    model,
    enabled,
    baseUrl,
    headers,
    setFormData,
    triggerFieldRefetch,
    globalContext,
    schema,
  ]);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (primaryKey && model && enabled) {
      fetchInitialData();
    }
  }, [fetchInitialData]);

  return {
    fetchInitialData,
    isLoading,
    error,
  };
}
