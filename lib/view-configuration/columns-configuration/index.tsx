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
import { useLensViewContext } from "@lens2/contexts/lens-view-context";
import { useViewContext } from "@lens2/contexts/view-context";
import { useViewConfig } from "@lens2/hooks/use-view-config";
import { Button } from "@lens2/shadcn/components/ui/button";
import { Input } from "@lens2/shadcn/components/ui/input";
import { Switch } from "@lens2/shadcn/components/ui/switch";
import * as logger from "@lens2/utils/logger";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { SortableColumnItem } from "./sortable-column-item";

export function ColumnsConfig() {
  const { view } = useViewContext();
  const { attributes: attributesRecord } = useLensViewContext();
  const { updateConfigChange } = useViewConfig();
  const [searchQuery, setSearchQuery] = useState("");

  // Convert attributes record to array for easier iteration
  const attributes = Object.values(attributesRecord || {});

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
    const allAttributeNames = Object.values(attributesRecord || {}).map(
      attr => attr.name
    );

    // If view has visibleColumns configured, use them. Otherwise, show all attributes
    const configuredVisibleColumns = view.config?.visibleColumns;
    setVisibleColumns(configuredVisibleColumns || allAttributeNames);

    // If view has columnOrder configured, use it. Otherwise, use attribute order
    const configuredColumnOrder = view.config?.columnOrder;
    setColumnOrder(configuredColumnOrder || allAttributeNames);
  }, [view.config?.visibleColumns, view.config?.columnOrder, attributesRecord]);

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(
    attr =>
      attr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate shown and hidden columns based on visibleColumns
  // First, get all shown columns (those in visibleColumns)
  const shownColumns = filteredAttributes.filter(attr =>
    visibleColumns.includes(attr.name)
  );

  // Then sort shown columns according to columnOrder
  const sortedShownColumns = shownColumns.sort((a, b) => {
    const aIndex = columnOrder.indexOf(a.name);
    const bIndex = columnOrder.indexOf(b.name);
    // If not in columnOrder, put at the end
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Hidden columns are all attributes not in visibleColumns
  const hiddenColumns = filteredAttributes.filter(
    attr => !visibleColumns.includes(attr.name)
  );

  const handleToggleColumn = async (columnName: string, checked: boolean) => {
    const newVisibleColumns = checked
      ? [...visibleColumns, columnName]
      : visibleColumns.filter(col => col !== columnName);

    setVisibleColumns(newVisibleColumns);

    // If making a column visible and it's not in columnOrder, add it
    if (checked && !columnOrder.includes(columnName)) {
      const newOrder = [...columnOrder, columnName];
      setColumnOrder(newOrder);

      // Apply both changes
      try {
        await updateConfigChange("visibleColumns", newVisibleColumns);
        await updateConfigChange("columnOrder", newOrder);
      } catch (error) {
        logger.error("Failed to update column configuration", error);
      }
    } else {
      // Apply visibility change only
      try {
        await updateConfigChange("visibleColumns", newVisibleColumns);
      } catch (error) {
        logger.error("Failed to update column visibility", error);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Get current order of shown columns
      const currentShownOrder = sortedShownColumns.map(col => col.name);
      const oldIndex = currentShownOrder.indexOf(active.id as string);
      const newIndex = currentShownOrder.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the order of shown columns
        const newShownOrder = arrayMove(currentShownOrder, oldIndex, newIndex);

        // Create a new full column order that preserves hidden columns
        // Start with the new order of shown columns
        const newOrder = [...newShownOrder];

        // Add any columns that were in the original columnOrder but not shown
        columnOrder.forEach(colName => {
          if (!newShownOrder.includes(colName)) {
            newOrder.push(colName);
          }
        });

        // Add any new columns that weren't in the original columnOrder
        const allAttributeNames = Object.values(attributesRecord || {}).map(
          attr => attr.name
        );
        allAttributeNames.forEach(colName => {
          if (!newOrder.includes(colName)) {
            newOrder.push(colName);
          }
        });

        setColumnOrder(newOrder);

        // Apply changes immediately
        try {
          await updateConfigChange("columnOrder", newOrder);
        } catch (error) {
          logger.error("Failed to update column order", error);
        }
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
            {sortedShownColumns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  setVisibleColumns([]);
                  try {
                    await updateConfigChange("visibleColumns", []);
                  } catch (error) {
                    logger.error("Failed to hide all columns", error);
                  }
                }}
              >
                Hide all
              </Button>
            )}
          </div>
          {sortedShownColumns.length === 0 ? (
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
                items={sortedShownColumns.map(column => column.name)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {sortedShownColumns.map(column => (
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
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-muted-foreground text-sm font-medium">
              Hidden
            </h4>
            {hiddenColumns.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const allAttributeNames = Object.values(
                    attributesRecord || {}
                  ).map(attr => attr.name);
                  setVisibleColumns(allAttributeNames);
                  try {
                    await updateConfigChange(
                      "visibleColumns",
                      allAttributeNames
                    );
                  } catch (error) {
                    logger.error("Failed to show all columns", error);
                  }
                }}
              >
                Show all
              </Button>
            )}
          </div>
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
