import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { useState } from "react";

export interface UseFormSubmissionOptions {
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  onSuccess?: (data: Record<string, any>, redirect: boolean) => void;
  onError?: (error: any) => void;
}

export interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  errors: any[];
  handleSubmit: (
    formData: Record<string, any>,
    cleanForm: boolean,
    redirect: boolean
  ) => Promise<void>;
  clearErrors: () => void;
}

/**
 * Shared hook for form submission logic
 * Can be used by both Material and Shadcn renderers
 */
export function useFormSubmission({
  onSubmit,
  onSuccess,
  onError,
}: UseFormSubmissionOptions = {}): UseFormSubmissionReturn {
  const { api, globalContext, config, setFormData } = useLensFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  function parseApiError(error: any) {
    const VALIDATION_MSG = "Validation failed. Please check your input.";

    if (error?.code === "NETWORK_ERROR" || !error?.response) {
      return {
        message: "Connection failed. Please try again.",
        type: "network",
        details: error,
      };
    }

    if (error?.response?.data) {
      const { success, error: errorData } = error.response.data;
      if (success === false) {
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          Object.values(errorData).some(value => Array.isArray(value))
        ) {
          return {
            message: VALIDATION_MSG,
            type: "validation",
            fieldErrors: errorData,
            details: errorData,
          };
        }
        if (typeof errorData === "string") {
          try {
            const parsed = JSON.parse(errorData);
            return {
              message: VALIDATION_MSG,
              type: "validation",
              fieldErrors: parsed.errors || parsed.field_errors,
              details: parsed,
            };
          } catch {
            return {
              message: VALIDATION_MSG,
              type: "validation",
              details: errorData,
            };
          }
        }
        return {
          message: errorData?.message || "Request failed.",
          type: "server",
          details: errorData,
        };
      }
    }

    if (error?.response?.status === 422) {
      return {
        message: VALIDATION_MSG,
        type: "validation",
        fieldErrors:
          error.response.data?.errors || error.response.data?.validation_errors,
        details: error.response.data,
      };
    }
    if (error?.response?.status === 403) {
      return {
        message: "Access denied.",
        type: "permission",
        details: error.response.data,
      };
    }

    return {
      message: "Something went wrong. Please try again.",
      type: "unknown",
      details: error,
    };
  }

  const handleSubmit = async (
    formData: Record<string, any>,
    cleanForm: boolean,
    redirect: boolean
  ) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      const { customSubmission } = globalContext;

      console.log("see the config here", config);

      if (customSubmission === true) {
        // console.log("check here", globalContext);
        const handleCustomSubmission = (globalContext as any)
          .customSubmissionFunction;

        if (
          handleCustomSubmission &&
          typeof handleCustomSubmission === "function"
        ) {
          await handleCustomSubmission(formData);
        }
      } else {
        // Merge form data with global context (params, primary_key, etc.)
        // Transform primaryKeyValue to use the actual primary key field name
        const { primaryKeyValue, ...restGlobalContext } = globalContext;
        const submitData = {
          ...formData,
          ...restGlobalContext,
          // Use the actual primary key field name instead of generic 'primaryKeyValue'
          ...(primaryKeyValue &&
            config?.primaryKey && {
              [config.primaryKey]: primaryKeyValue,
            }),
        };

        console.log("Submitting form data:", submitData);

        // Use the API to submit the form
        const result = await api.submitForm.mutateAsync(submitData);
        // console.log("result", result);

        if (cleanForm) {
          // Clear the form for next entry
          setFormData({});
        }

        console.log("Form submitted successfully:", result);
        result["submitdata"] = submitData;
        result["mutator_config"] = config;

        // Call the onSubmit callback if provided
        await onSubmit?.(result);

        // Call the onSuccess callback if provided
        await onSuccess?.(result, redirect);
      }
    } catch (error) {
      const parsedError = parseApiError(error);
      // console.log("parsedError", parsedError);
      setErrors([
        {
          message: parsedError.message,
          type: parsedError.type,
          fieldErrors: parsedError.fieldErrors,
          details: parsedError.details,
        },
      ]);

      // Call the onError callback with structured error
      onError?.(parsedError);

      // Call the onError callback if provided
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    isSubmitting,
    errors,
    handleSubmit,
    clearErrors,
  };
}
