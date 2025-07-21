import type { Attribute } from "@lens2/types/attributes";
import { ChipCondition } from "./chip-condition";
import { ChipFilter } from "./types";

interface ChipFilterListProps {
  filters: ChipFilter[];
  onFilterUpdate: (filter: ChipFilter) => void;
  onFilterRemove: (id: string) => void;
  getAttribute: (attribute: string) => Attribute | undefined;
}

export function ChipFilterList({
  filters,
  onFilterUpdate,
  onFilterRemove,
  getAttribute,
}: ChipFilterListProps) {
  return (
    <>
      {filters.map(filter => {
        const attribute = getAttribute(filter.attribute);
        if (!attribute) return null;

        return (
          <ChipCondition
            key={filter.id}
            filter={filter}
            attribute={attribute}
            onUpdate={onFilterUpdate}
            onRemove={onFilterRemove}
          />
        );
      })}
    </>
  );
}
