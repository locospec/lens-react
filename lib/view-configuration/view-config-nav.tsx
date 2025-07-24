import { useViewConfig } from "@lens2/hooks/use-view-config";
import {
  ChevronRight,
  Columns3,
  Group,
  Layout,
  Settings,
  SortAsc,
} from "lucide-react";
import React from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  disabled?: boolean;
}

export function ViewConfigNav() {
  const { view, navigateToPanel } = useViewConfig();

  // Define navigation items based on view type
  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      // {
      //   id: "settings",
      //   label: "View Settings",
      //   icon: Settings,
      //   description: "Name, description, and permissions",
      //   disabled: true,
      // },
    ];

    if (view.type === "table") {
      return [
        {
          id: "columns",
          label: "Columns",
          icon: Columns3,
          description: "Show, hide, and reorder columns",
        },
        // {
        //   id: "group",
        //   label: "Group",
        //   icon: Group,
        //   description: "Group rows by a field",
        //   disabled: true,
        // },
        // {
        //   id: "sort",
        //   label: "Sort",
        //   icon: SortAsc,
        //   description: "Sort your data",
        //   disabled: true,
        // },
        {
          id: "layout",
          label: "Layout Options",
          icon: Layout,
          description: "Adjust column widths and table layout",
        },
        ...commonItems,
      ];
    }

    // For other view types
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="p-2">
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className="hover:bg-accent flex w-full items-center justify-between rounded-lg p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => !item.disabled && navigateToPanel(item.id)}
            disabled={item.disabled}
          >
            <div className="flex items-center gap-3">
              <Icon className="text-muted-foreground h-5 w-5" />
              <div className="text-left">
                <div className="text-sm font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-muted-foreground text-xs">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
            {!item.disabled && (
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            )}
          </button>
        );
      })}
    </div>
  );
}
