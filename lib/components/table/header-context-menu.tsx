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
import { useTableSorting } from "@lens2/hooks/use-table-sorting";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@lens2/shadcn/components/ui/context-menu";
import { ArrowDown, ArrowUp, Minus, SortAsc, X } from "lucide-react";
import { cloneElement, isValidElement, useCallback, useRef } from "react";
import { SortableSortItem } from "./sortable-sort-item";

interface HeaderContextMenuProps {
  children: React.ReactNode;
  attribute: string;
}

export function HeaderContextMenu({
  children,
  attribute,
}: HeaderContextMenuProps) {
  // Use centralized sorting logic
  const {
    sorts: currentSorts,
    handleSortDirection,
    handleSortRemove,
    handleSortsClear,
    getSortStateForColumn,
    handleSortsReorder,
    isColumnSortable,
  } = useTableSorting();

  const sortState = getSortStateForColumn(attribute);
  const hasActiveSorts = currentSorts.length > 0;
  const isSortable = isColumnSortable(attribute);

  // Ref to access context menu trigger
  const triggerRef = useRef<HTMLDivElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSortAsc = useCallback(() => {
    handleSortDirection(attribute, "asc");
  }, [attribute, handleSortDirection]);

  const handleSortDesc = useCallback(() => {
    handleSortDirection(attribute, "desc");
  }, [attribute, handleSortDirection]);

  const handleClearSort = useCallback(() => {
    handleSortRemove(attribute);
  }, [attribute, handleSortRemove]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = currentSorts.findIndex(
          sort => sort.attribute === active.id
        );
        const newIndex = currentSorts.findIndex(
          sort => sort.attribute === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedSorts = arrayMove(currentSorts, oldIndex, newIndex);
          handleSortsReorder(reorderedSorts);
        }
      }
    },
    [currentSorts, handleSortsReorder]
  );

  // Handle click to open context menu
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only open context menu on left click, not when clicking sort icon
    if (e.button === 0 && triggerRef.current) {
      // Create a synthetic right-click event to trigger context menu
      const rect = triggerRef.current.getBoundingClientRect();
      const syntheticEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 2,
      });
      triggerRef.current.dispatchEvent(syntheticEvent);
      e.preventDefault();
    }
  }, []);

  // Clone children to add onClick handler
  const enhancedChildren = isValidElement(children)
    ? cloneElement(
        children as React.ReactElement<{
          onClick?: (e: React.MouseEvent) => void;
          ref?: React.Ref<HTMLDivElement>;
        }>,
        {
          onClick: handleClick,
          ref: triggerRef,
        }
      )
    : children;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{enhancedChildren}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel className="flex items-center gap-2 px-2 py-1.5">
          <SortAsc className="h-4 w-4" />
          Sort
        </ContextMenuLabel>

        {!sortState.isSorted && isSortable && (
          <>
            <ContextMenuItem
              onClick={handleSortAsc}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              Sort A-Z
            </ContextMenuItem>
            <ContextMenuItem
              onClick={handleSortDesc}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Sort Z-A
            </ContextMenuItem>
          </>
        )}

        {sortState.isSorted && (
          <ContextMenuItem
            onClick={handleClearSort}
            className="flex items-center gap-2"
            variant="destructive"
          >
            <Minus className="h-4 w-4" />
            Clear sort
          </ContextMenuItem>
        )}

        {hasActiveSorts && (
          <>
            <ContextMenuSeparator />
            <ContextMenuLabel>Sorting order</ContextMenuLabel>
            <div className="max-h-32 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentSorts.map(sort => sort.attribute)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {currentSorts.map(sort => (
                      <SortableSortItem
                        key={sort.attribute}
                        sort={sort}
                        onDirectionChange={handleSortDirection}
                        onRemove={handleSortRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={handleSortsClear}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <X className="h-4 w-4" />
              Clear all sorts
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
