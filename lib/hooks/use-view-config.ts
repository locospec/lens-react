import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import * as logger from "@lens2/utils/logger";
import { useCallback } from "react";

export function useViewConfig() {
  const {
    view,
    configSheetOpen,
    setConfigSheetOpen,
    activeConfigPanel,
    setActiveConfigPanel,
    configChanges,
    setConfigChanges,
    table,
  } = useViewContext();

  const { api } = useLensContext();
  const updateViewMutation = api.updateView();

  const openConfig = useCallback(
    (panel?: string) => {
      setConfigSheetOpen(true);
      if (panel) {
        setActiveConfigPanel(panel);
      }
    },
    [setConfigSheetOpen, setActiveConfigPanel]
  );

  const closeConfig = useCallback(() => {
    setConfigSheetOpen(false);
    setActiveConfigPanel("main");
    setConfigChanges({});
  }, [setConfigSheetOpen, setActiveConfigPanel, setConfigChanges]);

  const navigateToPanel = useCallback(
    (panel: string) => {
      setActiveConfigPanel(panel);
    },
    [setActiveConfigPanel]
  );

  const navigateBack = useCallback(() => {
    setActiveConfigPanel("main");
  }, [setActiveConfigPanel]);

  const updateConfigChange = useCallback(
    async (key: string, value: any) => {
      // For system views, only update local state, don't persist
      if (view.isSystem) {
        setConfigChanges({
          ...configChanges,
          [key]: value,
        });
        return;
      }

      // Update the view directly with merged config
      try {
        await updateViewMutation.mutateAsync({
          id: view.id,
          config: {
            ...view.config, // Keep existing config
            [key]: value, // Update specific key
          },
        });
      } catch (error) {
        logger.error("Failed to update view config:", error);
        throw error;
      }
    },
    [
      updateViewMutation,
      view.id,
      view.config,
      view.isSystem,
      setConfigChanges,
      configChanges,
    ]
  );

  const applyChanges = useCallback(async () => {
    if (Object.keys(configChanges).length === 0) {
      closeConfig();
      return;
    }

    // For system views, don't persist to backend
    if (view.isSystem) {
      // Changes are already in local state via configChanges
      closeConfig();
      return;
    }

    try {
      await updateViewMutation.mutateAsync({
        id: view.id,
        config: configChanges,
      });
      // The mutation automatically invalidates views query
      // ViewProvider will update the view state when views are refetched
      closeConfig();
    } catch (error) {
      logger.error("Failed to update view:", error);
    }
  }, [configChanges, closeConfig, updateViewMutation, view.id, view.isSystem]);

  const cancelChanges = useCallback(() => {
    closeConfig();
  }, [closeConfig]);

  return {
    view,
    configSheetOpen,
    activeConfigPanel,
    configChanges,
    openConfig,
    closeConfig,
    navigateToPanel,
    navigateBack,
    updateConfigChange,
    applyChanges,
    cancelChanges,
    table,
  };
}
