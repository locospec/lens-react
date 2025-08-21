import { useLensContext } from "@lens2/contexts/lens-context";
import type { RowData } from "@lens2/types/common";
import { useCallback, useMemo } from "react";

export interface UseRowInteractionsResult {
  // Row handlers
  handleRowClick: (rowData: RowData, event?: React.MouseEvent) => void;
  hasRowClickHandler: boolean;

  // Attribute/cell handlers
  getAttributeClickHandler: (
    attributeKey: string,
    value: any,
    rowData: RowData
  ) => ((event: React.MouseEvent) => void) | undefined;
  isAttributeClickable: (attributeKey: string) => boolean;
  getAttributeWrapper: (attributeKey: string) =>
    | React.ComponentType<{
        value: any;
        rowData: RowData;
        children: React.ReactNode;
      }>
    | undefined;

  // Component getters
  RowWrapper: React.ComponentType<{
    rowData: RowData;
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
  }>;

  // Actions configuration
  hasActions: boolean;
  actionsWidth: number;
  renderActions: ((rowData: RowData) => React.ReactNode) | undefined;
}

export function useRowInteractions(): UseRowInteractionsResult {
  const { interactions } = useLensContext();

  // Row click handler
  const handleRowClick = useCallback(
    (rowData: RowData, event?: React.MouseEvent) => {
      if (interactions?.onRowClick) {
        interactions.onRowClick({
          rowData,
          event,
        });
      }
    },
    [interactions]
  );

  // Check if attribute is clickable
  const isAttributeClickable = useCallback(
    (attributeKey: string) => {
      if (!interactions?.attributeInteractions) return false;
      const attributeInteraction =
        interactions.attributeInteractions[attributeKey];
      return (
        !!attributeInteraction?.clickable && !!attributeInteraction?.onClick
      );
    },
    [interactions]
  );

  // Get click handler for attribute
  const getAttributeClickHandler = useCallback(
    (attributeKey: string, value: any, rowData: RowData) => {
      if (!interactions?.attributeInteractions) return undefined;

      const attributeInteraction =
        interactions.attributeInteractions[attributeKey];

      if (!attributeInteraction?.clickable || !attributeInteraction?.onClick) {
        return undefined;
      }

      return (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        attributeInteraction.onClick!({
          value,
          rowData,
          event,
        });
      };
    },
    [interactions]
  );

  // Get custom wrapper for attribute
  const getAttributeWrapper = useCallback(
    (attributeKey: string) => {
      if (!interactions?.attributeInteractions) return undefined;
      return interactions.attributeInteractions[attributeKey]?.wrapper;
    },
    [interactions]
  );

  // Get row wrapper component
  const RowWrapper = useMemo(() => {
    return (
      interactions?.rowWrapper ||
      (({ children }: { children: React.ReactNode }) => children)
    );
  }, [interactions]);

  // Parse actions configuration
  const { hasActions, actionsWidth, renderActions } = useMemo(() => {
    if (!interactions?.actions) {
      return {
        hasActions: false,
        actionsWidth: 100,
        renderActions: undefined,
      };
    }

    return {
      hasActions: true,
      actionsWidth: interactions.actions.width || 100,
      renderActions: interactions.actions.render,
    };
  }, [interactions]);

  return {
    handleRowClick,
    hasRowClickHandler: !!interactions?.onRowClick,
    getAttributeClickHandler,
    isAttributeClickable,
    getAttributeWrapper,
    RowWrapper,
    hasActions,
    actionsWidth,
    renderActions,
  };
}
