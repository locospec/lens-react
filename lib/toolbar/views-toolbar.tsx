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
import type { CreateViewRequestPayload } from "@lens2/types";
import { ViewType } from "@lens2/types";
import * as logger from "@lens2/utils/logger";
import { motion } from "framer-motion";
import {
  Code,
  Columns3,
  LayoutGrid,
  List,
  Lock,
  Plus,
  RefreshCw,
  Settings2,
  Table2,
} from "lucide-react";
import { useState } from "react";

interface ToolbarProps {
  activeViewId: string;
  onViewChange: (viewId: string) => void;
}

const VIEW_TYPES = [
  { type: "table" as ViewType, label: "Table", enabled: true, icon: Table2 },
  { type: "list" as ViewType, label: "List", enabled: true, icon: List },
  {
    type: "kanban" as ViewType,
    label: "Kanban",
    enabled: false,
    icon: Columns3,
  },
  { type: "grid" as ViewType, label: "Grid", enabled: false, icon: LayoutGrid },
  { type: "raw" as ViewType, label: "Raw", enabled: false, icon: Code },
] as const;

export function ViewsToolbar({ activeViewId, onViewChange }: ToolbarProps) {
  const { views, api, query, viewScoping, enableForceRefresh, onForceRefresh } =
    useLensContext();
  const { openConfig } = useViewConfig();
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [contextMenuOpenId, setContextMenuOpenId] = useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const createViewMutation = api.createView({
    onSuccess: response => {
      logger.info("View created successfully", { response });
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
      is_default: false, // User-created views are never default
    };

    // Add scope_id and user_id if provided via viewScoping
    if (viewScoping?.scopeId) {
      viewPayload.scope_id = viewScoping.scopeId;
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

  // Helper to get icon for view type
  const getViewIcon = (viewType: ViewType) => {
    const viewConfig = VIEW_TYPES.find(v => v.type === viewType);
    return viewConfig?.icon || Table2;
  };

  return (
    <div className="flex items-center justify-between border-b">
      <div className="-mb-px flex items-center gap-2">
        {/* Animated Tabs */}
        <div className="flex space-x-2">
          {views.map(view => {
            const Icon = getViewIcon(view.type);
            const isContextMenuOpen = contextMenuOpenId === view.id;

            return (
              <ContextMenu
                key={view.id}
                onOpenChange={open =>
                  setContextMenuOpenId(open ? view.id : null)
                }
              >
                <ContextMenuTrigger asChild>
                  <button
                    onClick={() => onViewChange(view.id)}
                    className={`focus-visible:outline-ring relative rounded-md px-3 pt-2 pb-3 text-sm transition-colors outline-none focus-visible:outline-2 ${
                      activeViewId === view.id
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground font-normal"
                    } ${isContextMenuOpen ? "bg-muted" : ""} `}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {activeViewId === view.id && (
                      <motion.span
                        layoutId="underline"
                        className="bg-primary absolute right-0 bottom-0 left-0 h-[2px]"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-20 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {editingViewId === view.id ? (
                        <input
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
                          className="bg-muted min-w-[100px] rounded-sm border-none px-1.5 py-0.5 text-sm shadow-none ring-0 outline-none focus:border-none focus:ring-0 focus:outline-none"
                          onClick={e => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <>
                          {view.name}
                          {view.isSystem && (
                            <Lock className="ml-1 h-3 w-3 opacity-50" />
                          )}
                        </>
                      )}
                    </span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => startEditing(view.id, view.name)}
                    disabled={view.isSystem}
                  >
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleDelete(view.id)}
                    className="text-red-600"
                    disabled={view.is_default || view.isSystem}
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>

        <div className="h-4 border"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VIEW_TYPES.map(({ type, label, enabled, icon: Icon }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleCreateView(type)}
                disabled={!enabled}
                className={!enabled ? "opacity-50" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh button - only show if enabled */}
        {enableForceRefresh && onForceRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await onForceRefresh();
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        )}

        {/* Customize view button */}
        <Button variant="ghost" size="sm" onClick={() => openConfig()}>
          <Settings2 className="mr-2 h-4 w-4" />
          Customize view
        </Button>
      </div>
    </div>
  );
}
