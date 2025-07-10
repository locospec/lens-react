import { useViewContext } from "@lens2/contexts/view-context";
import { KanbanView } from "@lens2/views/kanban";
import { ListView } from "@lens2/views/list";
import { RawDisplay } from "@lens2/views/raw";
import { TableView } from "@lens2/views/table";

export function ViewContainer() {
  const { view } = useViewContext();

  const renderView = () => {
    switch (view.type) {
      case "table":
        return <TableView />;
      case "kanban":
        return <KanbanView />;
      case "list":
        return <ListView />;
      case "raw":
        return <RawDisplay />;
      default:
        return <TableView />;
    }
  };

  return <div className="flex-1 overflow-hidden">{renderView()}</div>;
}
