import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@lens2/forms/renderers/shadcn/src";
import {
  FORM_CONFIG,
  FORM_STATES,
} from "@lens2/forms/renderers/shared/form-constants";
import { FormErrorDisplay } from "@lens2/forms/renderers/shared/form-error-display";
import { useFormSubmission } from "@lens2/forms/renderers/shared/use-form-submission";
import { Button } from "@lens2/shadcn/components/ui/button";
import type { FormConfig } from "@lens2/types/form";
import { useState } from "react";

export interface ShadcnFormRendererProps {
  config: FormConfig;
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function ShadcnFormRenderer({
  config,
  formData,
  onChange,
  onSubmit,
}: ShadcnFormRendererProps) {
  const { schema, uiSchema } = config;
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  // Use shared form submission hook
  const {
    isSubmitting,
    errors: submissionErrors,
    handleSubmit,
  } = useFormSubmission({
    onSubmit,
  });

  // Combine material renderers with custom lens renderers
  const renderers = [...materialRenderers];

  // uiSchema?.options?.rowSpacing || FORM_CONFIG.ROW_SPACING,

  return (
    <>
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={formData}
        renderers={renderers}
        cells={materialCells}
        validationMode="ValidateAndShow"
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
