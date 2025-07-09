import { useState, useEffect, useMemo } from "react";
import { useViewContext } from "@lens2/contexts/view-context";
import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Switch } from "@lens2/shadcn/components/ui/switch";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Search } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableColumnItem } from "./sortable-column-item";

export function ColumnsConfig() {
  const { view } = useViewContext();
  const { config } = useLensContext();
  const { updateConfigChange } = useViewConfig();
  const [searchQuery, setSearchQuery] = useState("");

  // Get attributes from config
  const attributes = useMemo(
    () => Object.values(config?.attributes || {}),
    [config?.attributes]
  );

  // Initialize local state from view
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const defaultColumns = attributes.map(attr => attr.name);
    setVisibleColumns(view.config?.visibleColumns || defaultColumns);
    setColumnOrder(view.config?.columnOrder || defaultColumns);
  }, [view.config?.visibleColumns, view.config?.columnOrder, attributes]);

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(
    attr =>
      attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate shown and hidden columns (respecting order)
  const orderedAttributes = columnOrder
    .map(colName => attributes.find(attr => attr.name === colName))
    .filter((attr): attr is (typeof attributes)[0] => Boolean(attr));
  const shownColumns = orderedAttributes.filter(
    attr =>
      visibleColumns.includes(attr.name) && filteredAttributes.includes(attr)
  );
  const hiddenColumns = filteredAttributes.filter(
    attr => !visibleColumns.includes(attr.name)
  );

  const handleToggleColumn = async (columnName: string, checked: boolean) => {
    const newVisibleColumns = checked
      ? [...visibleColumns, columnName]
      : visibleColumns.filter(col => col !== columnName);

    setVisibleColumns(newVisibleColumns);

    // Apply changes immediately
    try {
      await updateConfigChange("visibleColumns", newVisibleColumns);
    } catch (error) {
      console.error("Failed to update column visibility:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);

      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);

      // Apply changes immediately
      try {
        await updateConfigChange("columnOrder", newOrder);
      } catch (error) {
        console.error("Failed to update column order:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for new or existing columns"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Columns Lists */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Shown Columns */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Shown</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              Hide all
            </Button>
          </div>
          {shownColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No columns
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={shownColumns.map(column => column.name)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {shownColumns.map(column => (
                    <SortableColumnItem
                      key={column.name}
                      column={column}
                      isVisible={true}
                      onToggle={handleToggleColumn}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Hidden Columns */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Hidden
          </h4>
          {hiddenColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hidden columns
            </p>
          ) : (
            <div className="space-y-1">
              {hiddenColumns.map(column => (
                <div
                  key={column.name}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                >
                  <div className="w-4" /> {/* Spacer for alignment */}
                  <span className="flex-1 text-sm">{column.label}</span>
                  <Switch
                    checked={false}
                    onCheckedChange={checked =>
                      handleToggleColumn(column.name, checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
