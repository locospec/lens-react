import { useLensContext } from "@lens2/contexts/lens-context";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@lens2/shadcn/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { ChipValueInput } from "./chip-value-input";
import { ChipFilter } from "./types";

interface ChipFilterCreatorProps {
  onSessionStart: () => string;
  onSessionEnd: () => void;
  onFilterUpdate: (attribute: string, value: unknown, operator: string) => void;
  sessionFilters: Map<string, ChipFilter>;
}

export function ChipFilterCreator({
  onSessionStart,
  onSessionEnd,
  onFilterUpdate,
  sessionFilters,
}: ChipFilterCreatorProps) {
  const { attributes } = useLensContext();
  const [open, setOpen] = useState(false);

  // Get attribute keys for iteration
  const attributeKeys = Object.keys(attributes);

  // Handle popover open/close
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);

      if (newOpen) {
        // Start a new session when opening
        onSessionStart();
      } else {
        // End session when closing
        onSessionEnd();
        setOpenSubmenu(null);
      }
    },
    [onSessionStart, onSessionEnd]
  );

  // Track which submenu is open for managing focus
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Handle value change
  const handleValueChange = useCallback(
    (attributeKey: string, value: unknown) => {
      const attribute = attributes[attributeKey];
      if (!attribute) {
        console.error(`Attribute ${attributeKey} not found`);
        return;
      }

      onFilterUpdate(attributeKey, value, attribute.defaultOperator);
    },
    [attributes, onFilterUpdate]
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-3 w-3" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-96 w-64 overflow-y-auto"
      >
        {attributeKeys.map(key => {
          const attr = attributes[key];
          const currentFilter = sessionFilters.get(key);

          return (
            <DropdownMenuSub
              key={key}
              open={openSubmenu === key}
              onOpenChange={isOpen => setOpenSubmenu(isOpen ? key : null)}
            >
              <DropdownMenuSubTrigger className="flex w-full items-center justify-between">
                <span>{attr.label}</span>
                {currentFilter && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    {String(currentFilter.value)}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-64">
                  <div className="p-2">
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      Filter by {attr.label}
                    </div>
                    <ChipValueInput
                      attribute={attr}
                      value={currentFilter?.value ?? ""}
                      operator={currentFilter?.operator || attr.defaultOperator}
                      onChange={value => handleValueChange(key, value)}
                      className="w-full"
                      isEditing={true}
                    />
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
        <DropdownMenuItem disabled className="text-muted-foreground text-xs">
          Hover over an attribute to filter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
