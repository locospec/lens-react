import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@lens2/forms/renderers/material/src";
import {
  FORM_CONFIG,
  FORM_STATES,
} from "@lens2/forms/renderers/shared/form-constants";
import { FormErrorDisplay } from "@lens2/forms/renderers/shared/form-error-display";
import { useFormSubmission } from "@lens2/forms/renderers/shared/use-form-submission";
import type { FormConfig } from "@lens2/types/form";
import { Box, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useState } from "react";

export interface MaterialFormRendererProps {
  config: FormConfig;
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function MaterialFormRenderer({
  config,
  formData,
  onChange,
  onSubmit,
}: MaterialFormRendererProps) {
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

  // Create theme with row spacing from UI schema
  const theme = createTheme({
    components: {
      MuiGrid: {
        defaultProps: {
          rowSpacing: uiSchema?.options?.rowSpacing || FORM_CONFIG.ROW_SPACING,
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
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
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit(formData)}
          disabled={isSubmitting}
          sx={{ minWidth: FORM_CONFIG.SUBMIT_BUTTON_WIDTH }}
        >
          {isSubmitting ? FORM_STATES.SUBMITTING : FORM_STATES.SUBMIT}
        </Button>
      </Box>
    </ThemeProvider>
  );
}
