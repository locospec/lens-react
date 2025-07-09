import { useViewConfig } from "@lens2/hooks/use-view-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  ContainerSheet,
  ContainerSheetContent,
} from "@lens2/shadcn/components/ui/container-sheet";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { ColumnsConfig } from "./columns-configuration";
import { FilterConfig } from "./filter-configuration";
import { LayoutPanel } from "./layout-configuration";
import { ViewConfigNav } from "./view-config-nav";

interface ViewConfigSheetProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

export function ViewConfigSheet({ containerRef }: ViewConfigSheetProps) {
  const { configSheetOpen, closeConfig, activeConfigPanel, navigateBack } =
    useViewConfig();

  const renderContent = () => {
    switch (activeConfigPanel) {
      case "main":
        return <ViewConfigNav />;
      case "columns":
        return <ColumnsConfig />;
      case "layout":
        return <LayoutPanel />;
      case "filter":
        return <FilterConfig />;
      // Add more config panels here
      default:
        return <ViewConfigNav />;
    }
  };

  const getTitle = () => {
    switch (activeConfigPanel) {
      case "main":
        return "Customize view";
      case "columns":
        return "Columns";
      case "layout":
        return "Layout Options";
      case "filter":
        return "Filters";
      default:
        return "Customize view";
    }
  };

  return (
    <ContainerSheet
      open={configSheetOpen}
      onOpenChange={open => {
        if (!open) {
          closeConfig();
        }
      }}
    >
      <ContainerSheetContent
        containerRef={containerRef}
        className="flex w-96 flex-col p-0"
      >
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            {activeConfigPanel !== "main" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={navigateBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="flex-1 text-lg font-semibold">{getTitle()}</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </ContainerSheetContent>
    </ContainerSheet>
  );
}
