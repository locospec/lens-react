/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import type { StatePropsOfMasterItem } from "@jsonforms/core";
import { withJsonFormsMasterListItemProps } from "@jsonforms/react";
import { Avatar, AvatarFallback } from "@lens2/shadcn/components/ui/avatar";
import { Button } from "@lens2/shadcn/components/ui/button";
import { cn } from "@lens2/shadcn/lib/utils";
import { Trash2 } from "lucide-react";

export const ShadcnListWithDetailMasterItem = ({
  index,
  childLabel,
  selected,
  enabled,
  handleSelect,
  removeItem,
  path,
  translations,
  disableRemove,
}: StatePropsOfMasterItem) => {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "hover:bg-muted border-border"
      )}
      onClick={handleSelect(index)}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{index + 1}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{childLabel}</p>
      </div>
      {enabled && !disableRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            removeItem(path, index)();
          }}
          className="hover:bg-destructive hover:text-destructive-foreground h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{translations.removeAriaLabel}</span>
        </Button>
      )}
    </div>
  );
};

export default withJsonFormsMasterListItemProps(ShadcnListWithDetailMasterItem);
