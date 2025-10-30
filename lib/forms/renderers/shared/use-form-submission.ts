import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { ERROR_MESSAGES } from "@lens2/forms/renderers/shared/form-constants";
import { useState } from "react";

export interface UseFormSubmissionOptions {
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  onSuccess?: (data: Record<string, any>) => void;
  onError?: (error: any) => void;
}

export interface UseFormSubmissionReturn {
  isSubmitting: boolean;
  errors: any[];
  handleSubmit: (formData: Record<string, any>) => Promise<void>;
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
  const { api, globalContext, config } = useLensFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
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

      console.log("Form submitted successfully:", result);

      // Call the onSubmit callback if provided
      await onSubmit?.(submitData);

      // Call the onSuccess callback if provided
      onSuccess?.(submitData);
    } catch (error) {
      console.error("Form submission failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.SUBMISSION_FAILED;

      setErrors([{ message: errorMessage }]);

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
