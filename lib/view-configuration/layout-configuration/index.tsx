import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import * as logger from "@lens2/utils/logger";
import { COLUMN_SIZES } from "@lens2/views/shared/constants";
import { ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface LayoutOption {
  id: string;
  label: string;
  description?: string;
  onClick: () => void;
}

export function LayoutPanel() {
  const { view, updateConfigChange, table } = useViewConfig();
  const { interactions } = useLensContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const measurementCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Create a canvas for text measurement
  const getMeasurementCanvas = useCallback(() => {
    if (!measurementCanvasRef.current) {
      measurementCanvasRef.current = document.createElement("canvas");
    }
    return measurementCanvasRef.current.getContext("2d");
  }, []);

  // Measure text width
  const measureText = useCallback(
    (
      text: string,
      font: string = "14px Inter, system-ui, sans-serif"
    ): number => {
      const context = getMeasurementCanvas();
      if (!context) return 0;

      context.font = font;
      const metrics = context.measureText(text);
      return Math.ceil(metrics.width);
    },
    [getMeasurementCanvas]
  );

  // Calculate optimal column width based on content
  const calculateColumnWidth = useCallback(
    (columnId: string): number => {
      if (!table) return COLUMN_SIZES.DEFAULT;

      const column = table.getColumn(columnId);
      if (!column) return COLUMN_SIZES.DEFAULT;

      // Start with header width + padding
      const headerText = (column.columnDef.header as string) || "";
      const headerWidth =
        measureText(headerText, "14px Inter, system-ui, sans-serif") + 40; // 40px for padding and sort icon

      // Get all visible cells for this column
      const rows = table.getRowModel().rows;
      let maxContentWidth = headerWidth;

      // Get extra width from interactions if defined
      const extraWidth =
        interactions?.attributeInteractions?.[columnId]?.extraWidth || 0;

      // Sample up to 100 rows for performance
      const sampleSize = Math.min(rows.length, 100);
      for (let i = 0; i < sampleSize; i++) {
        const cell = rows[i].getAllCells().find(c => c.column.id === columnId);
        if (cell) {
          const value = cell.getValue();
          const text = value != null ? String(value) : "";
          const contentWidth = measureText(text) + 32 + extraWidth; // 32px for cell padding + extra width
          maxContentWidth = Math.max(maxContentWidth, contentWidth);
        }
      }

      // Apply min/max constraints
      return Math.min(
        Math.max(maxContentWidth, COLUMN_SIZES.MIN),
        COLUMN_SIZES.MAX
      );
    },
    [table, measureText, interactions]
  );

  const handleResetColumnWidths = async () => {
    if (view.type !== "table" || !table) return;

    try {
      setIsProcessing(true);

      // Build default column sizes for all visible columns
      const allColumns = table.getAllColumns();
      const defaultSizes: Record<string, number> = {};

      allColumns.forEach(column => {
        if (column.getIsVisible() && column.id !== "selection") {
          defaultSizes[column.id] = COLUMN_SIZES.DEFAULT;
        }
      });

      // Apply default sizes to table state immediately
      table.setColumnSizing(defaultSizes);

      // Save default sizes to config
      await updateConfigChange("columnSizes", defaultSizes);
    } catch (error) {
      logger.error("Failed to reset column widths", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutosizeAllColumns = async () => {
    if (view.type !== "table" || !table) return;

    try {
      setIsProcessing(true);

      // Ensure we have data to measure
      const rows = table.getRowModel().rows;
      if (!rows.length) {
        logger.debug("No data available for autosize");
        return;
      }

      const allColumns = table.getAllColumns();
      const columnSizes: Record<string, number> = {};

      // Calculate optimal width for each visible column
      allColumns.forEach(column => {
        if (column.getIsVisible() && column.id !== "selection") {
          const optimalWidth = calculateColumnWidth(column.id);
          columnSizes[column.id] = optimalWidth;
        }
      });

      // Apply sizes to table state immediately
      table.setColumnSizing(columnSizes);

      // Save the new sizes to config
      await updateConfigChange("columnSizes", columnSizes);
    } catch (error) {
      logger.error("Failed to autosize columns", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const layoutOptions: LayoutOption[] = [
    {
      id: "reset-widths",
      label: "Reset column widths",
      description: "Reset all columns to their default widths",
      onClick: handleResetColumnWidths,
    },
    {
      id: "autosize-all",
      label: "Autosize all columns",
      description: "Automatically adjust column widths to fit content",
      onClick: handleAutosizeAllColumns,
    },
  ];

  return (
    <div className="p-4">
      <div className="space-y-1">
        {layoutOptions.map(option => (
          <button
            key={option.id}
            className="hover:bg-accent flex w-full items-center justify-between rounded-lg p-3 transition-colors disabled:opacity-50"
            onClick={option.onClick}
            disabled={isProcessing}
          >
            <div className="text-left">
              <div className="text-sm font-medium">{option.label}</div>
              {option.description && (
                <div className="text-muted-foreground text-xs">
                  {option.description}
                </div>
              )}
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
