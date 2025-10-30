import type { FormEndpoints, MutatorConfig } from "@lens2/types/form";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface LensFormApiOptions {
  endpoints: FormEndpoints;
  headers?: Record<string, string>;
  mutator: string;
}

export function useLensFormApi({
  endpoints,
  headers,
  mutator,
}: LensFormApiOptions) {
  // Fetch mutator configuration
  const config = useQuery({
    queryKey: ["form-config", mutator],
    queryFn: async (): Promise<MutatorConfig> => {
      const response = await fetch(endpoints.fetch_config, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error ||
            `Failed to fetch form configuration: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch form configuration");
      }

      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Submit form data
  const submitForm = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      // Get the config to determine the correct submit endpoint
      const configData = await config.refetch();
      const mutatorConfig = configData.data;

      if (!mutatorConfig) {
        throw new Error("No mutator configuration available");
      }

      // Build the submit endpoint based on the dbOp (create/update)
      const submitEndpoint = `${endpoints.baseEndpoint}/_${mutatorConfig.dbOp}`;

      const response = await fetch(submitEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.error || `Failed to submit form: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to submit form");
      }

      return result.data;
    },
  });

  // Fetch relation options for a specific model
  const fetchRelationOptions = (modelName: string) => {
    return useQuery({
      queryKey: ["relation-options", modelName],
      queryFn: async (): Promise<any[]> => {
        const response = await fetch(endpoints.query_relation_options, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ relation: modelName }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.error ||
              `Failed to fetch relation options: ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch relation options");
        }

        return result.data || [];
      },
      enabled: !!modelName,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return {
    config,
    submitForm,
    fetchRelationOptions,
    endpoints,
    headers,
  };
}
