import { useEffect } from "react";

type UseTableSyncSelectionOptions = {
  selectedItems: string[];
  selectedRows: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onSelect: (selectedData: string[]) => void;
};

const useTableSyncSelection = ({
  selectedItems,
  selectedRows,
  setRowSelection,
  onSelect,
}: UseTableSyncSelectionOptions) => {
  const areSelectionsDifferent = (): boolean => {
    const itemsKey = selectedItems.slice().sort().join(",");
    const rowsKey = Object.keys(selectedRows).sort().join(",");
    return itemsKey !== rowsKey;
  };

  // Sync selectedItems → selectedRows
  useEffect(() => {
    if (areSelectionsDifferent()) {
      const selectionMap = selectedItems.reduce<Record<string, boolean>>(
        (acc, id) => {
          acc[id] = true;
          return acc;
        },
        {}
      );

      // This is a temporary measure to handle async behaviour for React use Effects
      setTimeout(() => setRowSelection(selectionMap), 100);
      // setRowSelection(selectionMap);
    }
  }, [selectedItems]);

  // Sync selectedRows → selectedData → onSelect
  useEffect(() => {
    if (!areSelectionsDifferent()) return;

    const selectedKeys = Object.keys(selectedRows);

    onSelect(selectedKeys);
  }, [selectedRows]);
};

useTableSyncSelection.displayName = "useTableSyncSelection";

export { useTableSyncSelection };
