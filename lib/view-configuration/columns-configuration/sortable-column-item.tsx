import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@lens2/shadcn/components/ui/switch";
import { GripVertical } from "lucide-react";
interface Attribute {
  name: string;
  label: string;
  [key: string]: unknown;
}

interface SortableColumnItemProps {
  column: Attribute;
  isVisible: boolean;
  onToggle: (columnName: string, checked: boolean) => void;
}

export function SortableColumnItem({
  column,
  isVisible,
  onToggle,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`hover:bg-accent flex items-center gap-2 rounded-md p-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="text-muted-foreground h-4 w-4" />
      </div>
      <span className="flex-1 text-sm">{column.label}</span>
      <Switch
        checked={isVisible}
        onCheckedChange={checked => onToggle(column.name, checked)}
      />
    </div>
  );
}
