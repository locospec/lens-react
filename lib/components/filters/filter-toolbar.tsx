import { SearchBox } from "./search-box";
import { FilterButton } from "./filter-button";
import { QuickFilters } from "./quick-filters";
import { GroupByDropdown } from "./group-by-dropdown";

export function FilterToolbar() {
  return (
    <div className="flex gap-2 p-2 border-b">
      <SearchBox />
      {/* <FilterButton />
      <QuickFilters />
      <GroupByDropdown /> */}
    </div>
  );
}
