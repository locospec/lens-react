import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useLensContext } from "@lens2/contexts/lens-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Switch } from "@lens2/shadcn/components/ui/switch";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b p-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search for new or existing columns"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Columns Lists */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Shown Columns */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-muted-foreground text-sm font-medium">Shown</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              Hide all
            </Button>
          </div>
          {shownColumns.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
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
          <h4 className="text-muted-foreground mb-2 text-sm font-medium">
            Hidden
          </h4>
          {hiddenColumns.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No hidden columns
            </p>
          ) : (
            <div className="space-y-1">
              {hiddenColumns.map(column => (
                <div
                  key={column.name}
                  className="hover:bg-accent flex items-center gap-2 rounded-md p-2"
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
