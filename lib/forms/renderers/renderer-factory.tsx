import { ShadcnFormRenderer } from "@/locospec/lens-react-2/lib/forms/renderers/shadcn/form-renderer";
import type { FormConfig, FormRendererType } from "@lens2/types/form";

export interface FormRendererProps {
  config: FormConfig;
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onSuccess?: (data: Record<string, any>, redirect: boolean) => void;
  onError?: (error: Error) => void;
}

export function createFormRenderer(rendererType: FormRendererType) {
  switch (rendererType) {
    case "shadcn":
      return ShadcnFormRenderer;
    default:
      return ShadcnFormRenderer;
  }
}

export function FormRenderer({
  config,
  formData,
  onChange,
  onSubmit,
  onSuccess,
  onError,
  rendererType = "shadcn",
}: FormRendererProps & { rendererType: FormRendererType }) {
  const RendererComponent = createFormRenderer(rendererType);

  return (
    <RendererComponent
      config={config}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
