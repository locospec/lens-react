import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Sort, SortDirection } from "@lens2/types/view";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { useCallback } from "react";

interface SortableSortItemProps {
  sort: Sort;
  onDirectionChange: (attribute: string, direction: SortDirection) => void;
  onRemove: (attribute: string) => void;
}

export function SortableSortItem({
  sort,
  onDirectionChange,
  onRemove,
}: SortableSortItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sort.attribute });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDirectionToggle = useCallback(() => {
    const newDirection = sort.direction === "asc" ? "desc" : "asc";
    onDirectionChange(sort.attribute, newDirection);
  }, [sort.attribute, sort.direction, onDirectionChange]);

  const handleRemove = useCallback(() => {
    onRemove(sort.attribute);
  }, [sort.attribute, onRemove]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`hover:bg-accent group flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="text-muted-foreground h-3 w-3" />
      </div>
      <span className="flex-1 font-medium">
        {sort.attribute
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
      </span>
      <button
        onClick={handleDirectionToggle}
        className="hover:bg-accent-foreground/10 rounded-sm p-1 transition-colors"
        title={`Click to sort ${
          sort.direction === "asc" ? "descending" : "ascending"
        }`}
      >
        {sort.direction === "asc" ? (
          <ArrowUp className="text-muted-foreground h-3 w-3" />
        ) : (
          <ArrowDown className="text-muted-foreground h-3 w-3" />
        )}
      </button>
      <button
        onClick={handleRemove}
        className="hover:bg-destructive/10 rounded-sm p-1 opacity-0 transition-colors group-hover:opacity-100"
        title="Remove from sort"
      >
        <X className="text-destructive h-3 w-3" />
      </button>
    </div>
  );
}
