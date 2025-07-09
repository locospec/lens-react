import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import type { Attribute } from "@lens2/contexts/view-context";

type RowData = Record<string, any>;

export function buildTableColumns(
  attributes: Attribute[]
): ColumnDef<RowData>[] {
  const columnHelper = createColumnHelper<RowData>();

  if (!attributes || attributes.length === 0) {
    console.warn("No attributes available for table view");
    return [];
  }

  // Simple column generation from attributes
  return attributes.map((attr: Attribute) => {
    return columnHelper.accessor(attr.name, {
      id: attr.name,
      header: attr.label,
      size: 150, // Default size
      minSize: 50,
      maxSize: 500,
      meta: {
        type: attr.type,
        label: attr.label,
        primaryKey: attr.primaryKey,
      },
    });
  });
}