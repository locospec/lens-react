import { useLensContext } from "@lens2/contexts/lens-context";
import { AdvancedFilterBuilder } from "@lens2/filters/advanced/advanced-filter-builder";
import { ChipFilterBuilder } from "@lens2/filters/chip/chip-filter-builder";
import { SearchBox } from "@lens2/filters/search-box";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lens2/shadcn/components/ui/popover";
import { Filter } from "lucide-react";
import { useState } from "react";

export function FilterToolbar() {
  const { filterType } = useLensContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 border-b p-2">
      <SearchBox />

      {filterType === "chip" ? (
        /* Chip Filters */
        <ChipFilterBuilder className="flex-1" />
      ) : (
        /* Advanced Filter Button */
        <div className="flex flex-1 justify-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] p-0" align="start">
              <AdvancedFilterBuilder onClose={() => setOpen(false)} />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
