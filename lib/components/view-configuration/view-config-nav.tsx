import React from 'react';
import { useViewConfig } from '@lens2/hooks/use-view-config';
import { 
  Columns3, 
  Filter, 
  Group, 
  SortAsc, 
  ChevronRight,
  Settings,
  FileText,
  Layout
} from 'lucide-react';

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
      {
        id: 'settings',
        label: 'View Settings',
        icon: Settings,
        description: 'Name, description, and permissions',
        disabled: true
      }
    ];

    if (view.type === 'table') {
      return [
        {
          id: 'columns',
          label: 'Columns',
          icon: Columns3,
          description: 'Show, hide, and reorder columns'
        },
        {
          id: 'filter',
          label: 'Filter',
          icon: Filter,
          description: 'Filter your data',
          disabled: true
        },
        {
          id: 'group',
          label: 'Group',
          icon: Group,
          description: 'Group rows by a field',
          disabled: true
        },
        {
          id: 'sort',
          label: 'Sort',
          icon: SortAsc,
          description: 'Sort your data',
          disabled: true
        },
        {
          id: 'layout',
          label: 'Layout Options',
          icon: Layout,
          description: 'Adjust column widths and table layout'
        },
        ...commonItems
      ];
    }

    // For other view types
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="p-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => !item.disabled && navigateToPanel(item.id)}
            disabled={item.disabled}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                )}
              </div>
            </div>
            {!item.disabled && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
        );
      })}
    </div>
  );
}