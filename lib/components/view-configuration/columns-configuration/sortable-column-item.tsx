import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Switch } from '@lens2/shadcn/components/ui/switch';
interface Attribute {
  name: string;
  label: string;
  [key: string]: any;
}

interface SortableColumnItemProps {
  column: Attribute;
  isVisible: boolean;
  onToggle: (columnName: string, checked: boolean) => void;
}

export function SortableColumnItem({ column, isVisible, onToggle }: SortableColumnItemProps) {
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
      className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="flex-1 text-sm">{column.label}</span>
      <Switch
        checked={isVisible}
        onCheckedChange={(checked) => onToggle(column.name, checked)}
      />
    </div>
  );
}