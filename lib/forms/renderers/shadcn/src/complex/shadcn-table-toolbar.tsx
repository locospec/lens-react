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
import {
  ArrayTranslations,
  ControlElement,
  createDefaultValue,
  JsonSchema,
} from "@jsonforms/core";
import { Button } from "@lens2/shadcn/components/ui/button";
import { TableRow } from "@lens2/shadcn/components/ui/table";
import { Plus } from "lucide-react";
import React from "react";
import ShadcnNoBorderTableCell from "./shadcn-no-border-table-cell";
import ShadcnValidationIcon from "./shadcn-validation-icon";

export interface ShadcnTableToolbarProps {
  numColumns: number;
  errors: string;
  label: string;
  description: string;
  path: string;
  uischema: ControlElement;
  schema: JsonSchema;
  rootSchema: JsonSchema;
  enabled: boolean;
  translations: ArrayTranslations;
  addItem(path: string, value: any): () => void;
  disableAdd?: boolean;
}

const ShadcnTableToolbar = React.memo(function ShadcnTableToolbar({
  numColumns,
  errors,
  label,
  description,
  path,
  addItem,
  schema,
  enabled,
  translations,
  rootSchema,
  disableAdd,
}: ShadcnTableToolbarProps) {
  return (
    <TableRow>
      <ShadcnNoBorderTableCell colSpan={numColumns}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{label}</h3>
              {errors.length !== 0 && (
                <ShadcnValidationIcon
                  id="tooltip-validation"
                  errorMessages={errors}
                />
              )}
            </div>
            {enabled && !disableAdd && (
              <Button
                variant="outline"
                size="sm"
                onClick={addItem(path, createDefaultValue(schema, rootSchema))}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{translations.addTooltip}</span>
              </Button>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </ShadcnNoBorderTableCell>
    </TableRow>
  );
});

export default ShadcnTableToolbar;
