import { JsonForms } from "@jsonforms/react";
import { useLensFormContext } from "@lens2/contexts/lens-form-context";
import {
  shadcnCells,
  shadcnRenderers,
} from "@lens2/forms/renderers/shadcn/src";
import {
  FORM_CONFIG,
  FORM_STATES,
} from "@lens2/forms/renderers/shared/form-constants";
import { FormErrorDisplay } from "@lens2/forms/renderers/shared/form-error-display";
import { useFormSubmission } from "@lens2/forms/renderers/shared/use-form-submission";
import { useInitialDataFetch } from "@lens2/forms/renderers/shared/use-initial-data-fetch";
import { Button } from "@lens2/shadcn/components/ui/button";
import type { FormConfig } from "@lens2/types/form";
import { useState } from "react";

export interface ShadcnFormRendererProps {
  config: FormConfig;
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onSuccess?: (data: Record<string, any>) => void;
  onError?: (error: Error) => void;
}

export function ShadcnFormRenderer({
  config,
  formData,
  onChange,
  onSubmit,
  onSuccess,
  onError,
}: ShadcnFormRendererProps) {
  const { schema, uiSchema, primaryKey, model } = config;
  const { globalContext } = useLensFormContext();
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Use shared form submission hook
  const {
    isSubmitting,
    errors: submissionErrors,
    handleSubmit,
  } = useFormSubmission({
    onSubmit,
    onSuccess,
    onError,
  });

  // Combine shadcn renderers with custom lens renderers
  const renderers = [...shadcnRenderers];

  if (primaryKey && globalContext.primaryKeyValue) {
    // Handle initial data fetching for update forms
    // Uses primaryKey from globalContext and modelName from config
    const { isLoading: isInitialLoading, error: initialError } =
      useInitialDataFetch({
        primaryKey,
        model,
        enabled: !!primaryKey && !!model,
        schema,
      });

    // Show loading state while fetching initial data
    if (isInitialLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p>Loading form data...</p>
          </div>
        </div>
      );
    }

    // Show error if initial data fetch failed
    if (initialError) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="font-medium text-red-800">Error loading form data</h3>
          <p className="mt-1 text-sm text-red-600">{initialError.message}</p>
        </div>
      );
    }
  }

  return (
    <>
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={formData}
        renderers={renderers}
        cells={shadcnCells}
        validationMode="ValidateAndHide"
        onChange={({ data, errors }: any) => {
          if (data) {
            onChange(data);
          }
          setValidationErrors(errors || []);
        }}
        additionalErrors={[...validationErrors, ...submissionErrors]}
      />

      {/* Error Display */}
      <FormErrorDisplay errors={submissionErrors} className="mt-2" />

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => handleSubmit(formData)}
          disabled={isSubmitting}
          className={`min-w-[${FORM_CONFIG.SUBMIT_BUTTON_WIDTH}px]`}
        >
          {isSubmitting ? FORM_STATES.SUBMITTING : FORM_STATES.SUBMIT}
        </Button>
      </div>
    </>
  );
}
