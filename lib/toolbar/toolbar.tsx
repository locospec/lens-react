import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@lens2/shadcn/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lens2/shadcn/components/ui/dropdown-menu";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@lens2/shadcn/components/ui/tabs";
import type { CreateViewRequestPayload } from "@lens2/types";
import { ViewType } from "@lens2/types";
import { Plus, Settings2 } from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
  activeViewId: string;
  onViewChange: (viewId: string) => void;
}

const VIEW_TYPES = [
  { type: "table" as ViewType, label: "Table", enabled: true },
  { type: "list" as ViewType, label: "List", enabled: true },
  { type: "kanban" as ViewType, label: "Kanban", enabled: false },
  { type: "grid" as ViewType, label: "Grid", enabled: false },
  { type: "raw" as ViewType, label: "Raw", enabled: false },
] as const;

export function Toolbar({ activeViewId, onViewChange }: ToolbarProps) {
  const { views, api, query, viewScoping } = useLensContext();
  const { openConfig } = useViewConfig();
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const createViewMutation = api.createView({
    onSuccess: response => {
      console.log("View created successfully:", response);
      // Switch to the new view
      if (response?.data?.id) {
        onViewChange(response.data.id);
      }
    },
  });

  const updateViewMutation = api.updateView({
    onSuccess: () => {
      setEditingViewId(null);
    },
  });

  const deleteViewMutation = api.deleteView({
    onSuccess: (_, variables) => {
      // Check if we deleted the currently active view
      if (activeViewId === variables.primary_key) {
        // Find the default view and switch to it
        const defaultView = views.find(v => v.is_default);
        if (defaultView) {
          onViewChange(defaultView.id);
        }
      }
    },
  });

  const handleCreateView = (type: ViewType) => {
    const defaultNames = {
      table: "Table",
      list: "List",
      kanban: "Kanban",
      grid: "Grid",
      raw: "Raw",
    };

    const viewPayload: CreateViewRequestPayload = {
      belongs_to_type: "query",
      belongs_to_value: query,
      type: type,
      name: defaultNames[type],
      config: {},
    };

    // Add tenant_id and user_id if provided via viewScoping
    if (viewScoping?.tenantId) {
      viewPayload.tenant_id = viewScoping.tenantId;
    }
    if (viewScoping?.userId) {
      viewPayload.user_id = viewScoping.userId;
    }

    createViewMutation.mutate(viewPayload);
  };

  const handleRename = (viewId: string, newName: string) => {
    updateViewMutation.mutate({
      id: viewId,
      name: newName,
    });
  };

  const handleDelete = (viewId: string) => {
    deleteViewMutation.mutate({
      primary_key: viewId,
    });
  };

  const startEditing = (viewId: string, currentName: string) => {
    setEditingViewId(viewId);
    setEditingName(currentName);
  };

  const finishEditing = () => {
    if (editingViewId && editingName.trim()) {
      handleRename(editingViewId, editingName.trim());
    }
    setEditingViewId(null);
  };

  return (
    <div className="flex items-center justify-between border-b p-2">
      <div className="flex items-center gap-2">
        <Tabs value={activeViewId} onValueChange={onViewChange}>
          <TabsList>
            {views.map(view => (
              <ContextMenu key={view.id}>
                <ContextMenuTrigger>
                  <TabsTrigger value={view.id} className="relative">
                    {editingViewId === view.id ? (
                      <Input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            finishEditing();
                          } else if (e.key === "Escape") {
                            setEditingViewId(null);
                          }
                        }}
                        className="h-6 min-w-[100px] px-2"
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      view.name
                    )}
                  </TabsTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => startEditing(view.id, view.name)}
                  >
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDelete(view.id)}
                    className="text-red-600"
                    disabled={view.is_default}
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VIEW_TYPES.map(({ type, label, enabled }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleCreateView(type)}
                disabled={!enabled}
                className={!enabled ? "opacity-50" : ""}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {/* Customize view button */}
        <Button variant="outline" size="sm" onClick={() => openConfig()}>
          <Settings2 className="mr-2 h-4 w-4" />
          Customize view
        </Button>
      </div>
    </div>
  );
}
