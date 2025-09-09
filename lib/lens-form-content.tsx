import { useCallback } from "react";
import { useLensFormContext } from "./contexts/lens-form-context";
import { useLensFormDebugClient } from "./contexts/lens-form-debug-context";
import { FormRenderer } from "./forms/renderers/renderer-factory";
import type { LensFormContentProps } from "./types/form";
import { ErrorDisplay } from "./ui/error-display";
import { Loading } from "./ui/loading";

export function LensFormContent({ onError }: LensFormContentProps) {
  const { config, isLoading, error, formData, setFormData, rendererType } =
    useLensFormContext();
  const debugClient = useLensFormDebugClient();

  // Handle form data changes
  const handleFormChange = useCallback(
    (data: Record<string, any>) => {
      setFormData(data);
    },
    [setFormData]
  );

  // Handle form submission (no-op since it's handled in FormRenderer)
  const handleFormSubmit = useCallback(async (data: Record<string, any>) => {
    // Form submission is handled internally in FormRenderer
  }, []);

  // Handle loading state
  if (isLoading) {
    return <Loading />;
  }

  // Handle error state
  if (error) {
    onError?.(error);
    return <ErrorDisplay error={error} />;
  }

  // Handle no config state
  if (!config) {
    return (
      <ErrorDisplay error={new Error("No form configuration available")} />
    );
  }

  return (
    <div className="@container/lens-form flex h-full flex-col space-y-2">
      <FormRenderer
        config={config}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleFormSubmit}
        rendererType={rendererType}
      />
    </div>
  );
}
