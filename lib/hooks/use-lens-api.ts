import { useLensDebugClient } from "@lens2/contexts/lens-debug-context";
import type {
  ApiResponse,
  ConfigResponse,
  CreateCustomAttributePayload,
  CreateViewRequestPayload,
  CustomAttribute,
  DeleteCustomAttributePayload,
  DeleteViewRequestPayload,
  Json,
  LensEndpoints,
  RelationOptionsResponse,
  UpdateCustomAttributePayload,
  UpdateRequestPayload,
  UpdateViewRequestPayload,
  View,
  ViewScoping,
  ViewsResponse,
} from "@lens2/types";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

/**
 * useLensApi - A unified API hook for all Lens operations
 *
 * Usage Examples:
 *
 * // Initialize the API
 * const api = useLensApi({ endpoints, headers });
 *
 * // Queries
 * const { data: config } = api.config();
 * const { data: views } = api.views();
 * const { data: viewData } = api.view('view-id');
 * // Mutations (with payloads)
 * const updateMutation = api.updateData();
 * updateMutation.mutate({ id: 123, field: 'name', value: 'New Name' });
 *
 * const createViewMutation = api.createView();
 * createViewMutation.mutate({
 *   name: 'My View',
 *   type: 'table',
 *   columns: ['id', 'name', 'status'],
 *   metadata: { ... }
 * });
 *
 * const updateViewMutation = api.updateView();
 * updateViewMutation.mutate({
 *   id: 'view-123',
 *   name: 'Updated View Name',
 *   columns: ['id', 'name', 'status', 'date']
 * });
 *
 * const deleteViewMutation = api.deleteView();
 * deleteViewMutation.mutate('view-123');
 */

interface UseLensApiFactoryProps {
  endpoints: LensEndpoints;
  headers?: Record<string, string>;
  query: string;
  enableViews?: boolean;
  viewScoping?: ViewScoping;
}

export const useLensApi = ({
  endpoints,
  headers,
  query,
  enableViews = true,
  viewScoping,
}: UseLensApiFactoryProps) => {
  const queryClient = useQueryClient();
  const {
    addApiCall,
    updateApiCall,
    enabled: debugEnabled,
  } = useLensDebugClient();

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Helper function to track API calls
  const trackApiCall = async <T>(
    method: string,
    endpoint: string,
    body: unknown,
    fetchFn: () => Promise<Response>
  ): Promise<T> => {
    // If debug is not enabled, just execute the fetch directly
    if (!debugEnabled) {
      const response = await fetchFn();
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Failed: ${response.statusText}`);
      }

      return responseData;
    }

    // Debug is enabled, track the call
    const startTime = Date.now();

    // Add initial call with more descriptive message
    const callId = addApiCall({
      method,
      endpoint,
      request: body,
    });

    try {
      const response = await fetchFn();
      const responseData = await response.json();

      // Update call with response
      updateApiCall(callId, {
        response: responseData,
        status: response.status,
        duration: Date.now() - startTime,
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.statusText}`);
      }

      return responseData;
    } catch (error) {
      // Update call with error
      updateApiCall(callId, {
        response: error,
        status: 0,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  };

  const useConfig = (options?: UseQueryOptions<ConfigResponse>) => {
    return useQuery<ConfigResponse>({
      queryKey: ["lens", query, "config"],
      queryFn: async () => {
        const body = {};
        const result = await trackApiCall<ApiResponse<ConfigResponse>>(
          "POST",
          endpoints.fetch_config,
          body,
          () =>
            fetch(endpoints.fetch_config, {
              method: "POST",
              headers: defaultHeaders,
              body: JSON.stringify(body),
            })
        );
        // Return only the data portion, not the wrapper
        return result.data;
      },
      ...options,
    });
  };

  const useViews = (options?: UseQueryOptions<ViewsResponse>) => {
    return useQuery<ViewsResponse>({
      queryKey: ["lens", query, "views", enableViews],
      staleTime: enableViews ? 0 : Infinity, // Never refetch if views are disabled
      refetchOnMount: enableViews,
      refetchOnWindowFocus: false,
      queryFn: async () => {
        // If views are disabled, return a static default view
        if (!enableViews) {
          const defaultView = {
            id: "default-view",
            name: "Default View",
            type: "table",
            is_default: true,
            belongs_to_type: "query",
            belongs_to_value: query,
            config: {},
          } as View;
          return {
            views: [defaultView],
            defaultView: defaultView,
          };
        }
        const conditions = [
          {
            attribute: "belongs_to_type",
            op: "is",
            value: "query",
          },
          {
            attribute: "belongs_to_value",
            op: "is",
            value: query,
          },
        ];

        // Add viewScoping filters if provided
        if (viewScoping?.tenantId) {
          conditions.push({
            attribute: "tenant_id",
            op: "is",
            value: viewScoping.tenantId,
          });
        }
        if (viewScoping?.userId) {
          conditions.push({
            attribute: "user_id",
            op: "is",
            value: viewScoping.userId,
          });
        }

        const body = {
          pagination: {
            type: "cursor",
            per_page: 50,
            cursor: null,
          },
          filters: {
            op: "and",
            conditions: conditions,
          },
        };

        const result = await trackApiCall<ApiResponse<View[]>>(
          "POST",
          endpoints.list_views,
          body,
          () =>
            fetch(endpoints.list_views, {
              method: "POST",
              headers: defaultHeaders,
              body: JSON.stringify(body),
            })
        );

        const viewsData = result.data || [];
        return {
          views: viewsData as View[],
          defaultView: viewsData.find(
            (v: View) => v.is_default || v.name === "Default"
          ),
        };
      },
      ...options,
    });
  };

  const useCustomAttributes = (
    options?: UseQueryOptions<ApiResponse<CustomAttribute[]>>
  ) => {
    return useQuery<ApiResponse<CustomAttribute[]>>({
      queryKey: ["lens", query, "customAttributes"],
      queryFn: async () => {
        const body = {
          filters: {
            conditions: [
              {
                field: "query",
                op: "is",
                value: query,
              },
            ],
          },
        };

        const response = await fetch(endpoints.list_custom_attributes, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch custom attributes: ${response.statusText}`
          );
        }

        return response.json();
      },
      ...options,
    });
  };

  const useRelationOptions = (
    field: string,
    search?: string,
    options?: UseQueryOptions<RelationOptionsResponse>
  ) => {
    return useQuery<RelationOptionsResponse>({
      queryKey: ["lens", query, "relationOptions", field, search],
      queryFn: async () => {
        const response = await fetch(endpoints.query_relation_options, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify({ field, search }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch relation options: ${response.statusText}`
          );
        }

        return response.json();
      },
      ...options,
    });
  };

  // Mutations
  const useUpdateData = (
    options?: UseMutationOptions<ApiResponse<Json>, Error, UpdateRequestPayload>
  ) => {
    // Extract user's callbacks
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<ApiResponse<Json>, Error, UpdateRequestPayload>({
      ...restOptions,
      mutationFn: async (payload: UpdateRequestPayload) => {
        const result = await trackApiCall<ApiResponse<Json>>(
          "POST",
          endpoints.update_data,
          payload,
          () =>
            fetch(endpoints.update_data, {
              method: "POST",
              headers: defaultHeaders,
              body: JSON.stringify(payload),
            })
        );

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useCreateView = (
    options?: UseMutationOptions<
      ApiResponse<View>,
      Error,
      CreateViewRequestPayload
    >
  ) => {
    // Extract user's callbacks
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<ApiResponse<View>, Error, CreateViewRequestPayload>({
      ...restOptions,
      mutationFn: async (payload: CreateViewRequestPayload) => {
        // If views are disabled, return the static default view
        if (!enableViews) {
          return {
            data: {
              id: "default-view",
              name: "Default View",
              type: "table",
              is_default: true,
              belongs_to_type: "query",
              belongs_to_value: query,
              config: {},
            } as View,
          };
        }
        const response = await fetch(endpoints.create_view, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to create view: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "views"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useUpdateView = (
    options?: UseMutationOptions<
      ApiResponse<View>,
      Error,
      UpdateViewRequestPayload
    >
  ) => {
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<ApiResponse<View>, Error, UpdateViewRequestPayload>({
      ...restOptions,
      mutationFn: async (payload: UpdateViewRequestPayload) => {
        // If views are disabled, return success without doing anything
        if (!enableViews) {
          return { data: {} as View };
        }
        // For update, send {id, name} directly as JSON
        const response = await fetch(endpoints.update_view, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update view: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "views"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useDeleteView = (
    options?: UseMutationOptions<
      ApiResponse<Json>,
      Error,
      DeleteViewRequestPayload
    >
  ) => {
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<ApiResponse<Json>, Error, DeleteViewRequestPayload>({
      ...restOptions,
      mutationFn: async (payload: DeleteViewRequestPayload) => {
        // If views are disabled, return success without doing anything
        if (!enableViews) {
          return { data: {} };
        }
        const response = await fetch(endpoints.delete_view, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete view: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "views"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useCreateCustomAttribute = (
    options?: UseMutationOptions<
      ApiResponse<CustomAttribute>,
      Error,
      CreateCustomAttributePayload
    >
  ) => {
    // Extract user's callbacks
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<
      ApiResponse<CustomAttribute>,
      Error,
      CreateCustomAttributePayload
    >({
      ...restOptions,
      mutationFn: async (payload: CreateCustomAttributePayload) => {
        const response = await fetch(endpoints.create_custom_attribute, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create custom attribute: ${response.statusText}`
          );
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "customAttributes"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useUpdateCustomAttribute = (
    options?: UseMutationOptions<
      ApiResponse<CustomAttribute>,
      Error,
      UpdateCustomAttributePayload
    >
  ) => {
    // Extract user's callbacks
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<
      ApiResponse<CustomAttribute>,
      Error,
      UpdateCustomAttributePayload
    >({
      ...restOptions,
      mutationFn: async (payload: UpdateCustomAttributePayload) => {
        const response = await fetch(endpoints.update_custom_attribute, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to update custom attribute: ${response.statusText}`
          );
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "customAttributes"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  const useDeleteCustomAttribute = (
    options?: UseMutationOptions<
      ApiResponse<Json>,
      Error,
      DeleteCustomAttributePayload
    >
  ) => {
    // Extract user's callbacks
    const { onSuccess: userOnSuccess, ...restOptions } = options || {};

    return useMutation<ApiResponse<Json>, Error, DeleteCustomAttributePayload>({
      ...restOptions,
      mutationFn: async (payload: DeleteCustomAttributePayload) => {
        const response = await fetch(endpoints.delete_custom_attribute, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to delete custom attribute: ${response.statusText}`
          );
        }

        const result = await response.json();

        // Invalidate immediately after successful mutation
        await queryClient.invalidateQueries({
          queryKey: ["lens", query, "customAttributes"],
        });

        return result;
      },
      onSuccess: userOnSuccess,
    });
  };

  return {
    // Queries
    config: useConfig,
    views: useViews,
    customAttributes: useCustomAttributes,
    relationOptions: useRelationOptions,
    // Mutations
    updateData: useUpdateData,
    createView: useCreateView,
    updateView: useUpdateView,
    deleteView: useDeleteView,
    createCustomAttribute: useCreateCustomAttribute,
    updateCustomAttribute: useUpdateCustomAttribute,
    deleteCustomAttribute: useDeleteCustomAttribute,
  };
};
