import { MaterialFormRenderer } from "@/locospec/lens-react-2/lib/forms/renderers/material/form-renderer";
import { ShadcnFormRenderer } from "@/locospec/lens-react-2/lib/forms/renderers/shadcn/form-renderer";
import type { FormConfig, FormRendererType } from "@lens2/types/form";

export interface FormRendererProps {
  config: FormConfig;
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function createFormRenderer(rendererType: FormRendererType) {
  switch (rendererType) {
    case "material":
      return MaterialFormRenderer;
    case "shadcn":
      return ShadcnFormRenderer;
    case "custom":
      // For custom renderers, you can extend this
      return MaterialFormRenderer; // Default fallback
    default:
      return MaterialFormRenderer;
  }
}

export function FormRenderer({
  config,
  formData,
  onChange,
  onSubmit,
  rendererType = "material",
}: FormRendererProps & { rendererType: FormRendererType }) {
  const RendererComponent = createFormRenderer(rendererType);

  return (
    <RendererComponent
      config={config}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
