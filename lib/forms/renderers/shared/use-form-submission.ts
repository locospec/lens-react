import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import { ERROR_MESSAGES } from "@lens2/forms/renderers/shared/form-constants";
import { useState } from "react";

export interface UseFormSubmissionOptions {
  onSubmit?: (data: Record<string, any>) => Promise<void>;
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
}: UseFormSubmissionOptions = {}): UseFormSubmissionReturn {
  const { api, globalContext } = useLensFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);

  const handleSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Merge form data with global context (params, primary_key, etc.)
      const submitData = {
        ...formData,
        ...globalContext,
      };

      console.log("Submitting form data:", submitData);

      // Use the API to submit the form
      const result = await api.submitForm.mutateAsync(submitData);

      console.log("Form submitted successfully:", result);

      // Call the onSubmit callback if provided
      await onSubmit?.(submitData);
    } catch (error) {
      console.error("Form submission failed:", error);
      setErrors([
        {
          message:
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.SUBMISSION_FAILED,
        },
      ]);
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
