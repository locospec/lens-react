// @ts-nocheck
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
  ArrayLayoutProps,
  ArrayTranslations,
  ControlElement,
  errorAt,
  formatErrorMessage,
  JsonFormsCellRendererRegistryEntry,
  JsonSchema,
  Paths,
  Resolve,
} from "@jsonforms/core";
import { DispatchCell, useJsonForms } from "@jsonforms/react";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lens2/shadcn/components/ui/table";
import startCase from "lodash/startCase";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import React from "react";

import merge from "lodash/merge";
import { WithDeleteDialogSupport } from "./shadcn-delete-dialog";
import ShadcnTableToolbar from "./shadcn-table-toolbar";

// we want a cell that doesn't automatically span
const styles = {
  fixedCell: {
    width: "150px",
    height: "50px",
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: "center",
  },
  fixedCellSmall: {
    width: "50px",
    height: "50px",
    paddingLeft: 0,
    paddingRight: 0,
    textAlign: "center",
  },
};

const generateCells = (
  Cell: React.ComponentType<OwnPropsOfNonEmptyCell | TableHeaderCellProps>,
  schema: JsonSchema,
  rowPath: string,
  enabled: boolean,
  cells?: JsonFormsCellRendererRegistryEntry[]
) => {
  if (schema.type === "object") {
    return getValidColumnProps(schema).map(prop => {
      const cellPath = Paths.compose(rowPath, prop);
      const props = {
        propName: prop,
        schema,
        title: schema.properties?.[prop]?.title ?? startCase(prop),
        path: cellPath,
        enabled,
        cells,
      };
      return <Cell key={cellPath} {...props} />;
    });
  } else {
    const props = {
      schema,
      title: schema.title ?? "Item",
      path: rowPath,
      enabled,
      cells,
    };
    return <Cell key={rowPath} {...props} />;
  }
};

const getValidColumnProps = (schema: JsonSchema): string[] => {
  if (!schema.properties) {
    return [];
  }
  return Object.keys(schema.properties).filter(
    prop => schema.properties?.[prop]?.type !== "object"
  );
};

interface OwnPropsOfNonEmptyCell {
  propName?: string;
  schema: JsonSchema;
  title: string;
  path: string;
  enabled: boolean;
  cells?: JsonFormsCellRendererRegistryEntry[];
}

interface TableHeaderCellProps {
  title: string;
}

export const ShadcnTableControl = (
  props: ArrayLayoutProps & ArrayTranslations & WithDeleteDialogSupport
) => {
  const {
    addItem,
    data,
    path,
    schema,
    uischema,
    errors,
    enabled,
    visible,
    cells,
    translations,
    openDeleteDialog,
  } = props;
  const { ctx } = useJsonForms();
  const controlElement = uischema as ControlElement;
  const childPath = Paths.compose(path, controlElement.scope);
  const resolvedSchema = Resolve.schema(
    ctx?.schema ?? {},
    childPath,
    ctx?.rootSchema
  );
  const arrayEnum = resolvedSchema?.items?.enum;
  const arrayOneOf = resolvedSchema?.items?.oneOf;
  const arrayAnyOf = resolvedSchema?.items?.anyOf;
  const hasEnumValues = arrayEnum || arrayOneOf || arrayAnyOf;
  const appliedUiSchemaOptions = merge({}, controlElement.options);
  const isPrimitiveArray =
    schema?.type === "array" && schema?.items?.type !== "object";
  const isObjectArray =
    schema?.type === "array" && schema?.items?.type === "object";

  const createDefaultValue = React.useCallback(() => {
    if (hasEnumValues) {
      return arrayEnum?.[0] ?? arrayOneOf?.[0] ?? arrayAnyOf?.[0];
    }
    if (isPrimitiveArray) {
      return "";
    }
    if (isObjectArray) {
      return {};
    }
    return "";
  }, [
    hasEnumValues,
    arrayEnum,
    arrayOneOf,
    arrayAnyOf,
    isPrimitiveArray,
    isObjectArray,
  ]);

  const addItemCb = React.useCallback(() => {
    addItem(path, createDefaultValue())();
  }, [addItem, path, createDefaultValue]);

  const moveUp = React.useCallback(
    (index: number) => {
      if (index > 0) {
        const newData = [...data];
        [newData[index - 1], newData[index]] = [
          newData[index],
          newData[index - 1],
        ];
        // Handle move up logic here
      }
    },
    [data]
  );

  const moveDown = React.useCallback(
    (index: number) => {
      if (index < data.length - 1) {
        const newData = [...data];
        [newData[index], newData[index + 1]] = [
          newData[index + 1],
          newData[index],
        ];
        // Handle move down logic here
      }
    },
    [data]
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ShadcnTableToolbar
        numSelected={0}
        addItem={addItemCb}
        numColumns={
          isObjectArray ? getValidColumnProps(resolvedSchema?.items).length : 1
        }
        translations={translations}
        errors={errors?.map(e => e.message).join("\n") || ""}
        label={uischema?.label || "Array"}
        description={uischema?.description || ""}
        path={path}
        uischema={uischema}
        schema={schema}
        rootSchema={ctx?.rootSchema || {}}
        enabled={enabled}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isObjectArray &&
                getValidColumnProps(resolvedSchema?.items).map(prop => (
                  <TableHead key={prop}>
                    {resolvedSchema?.items?.properties?.[prop]?.title ??
                      startCase(prop)}
                  </TableHead>
                ))}
              {isPrimitiveArray && <TableHead>Value</TableHead>}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item, index) => {
              const rowPath = Paths.compose(path, `${index}`);
              const errorsAt = errorAt(path, index)(errors);
              const errorMessage = formatErrorMessage(errorsAt);

              return (
                <TableRow key={index}>
                  {isObjectArray &&
                    getValidColumnProps(resolvedSchema?.items).map(prop => (
                      <TableCell key={prop}>
                        <DispatchCell
                          schema={resolvedSchema?.items}
                          path={Paths.compose(rowPath, prop)}
                          enabled={enabled}
                          cells={cells}
                        />
                      </TableCell>
                    ))}
                  {isPrimitiveArray && (
                    <TableCell>
                      <DispatchCell
                        schema={resolvedSchema?.items}
                        path={rowPath}
                        enabled={enabled}
                        cells={cells}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || !enabled}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(index)}
                        disabled={index === data.length - 1 || !enabled}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(rowPath, index)}
                        disabled={!enabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {errors && errors.length > 0 && (
        <div className="text-destructive text-sm">
          {errors.map((error, index) => (
            <div key={index}>{error.message}</div>
          ))}
        </div>
      )}
    </div>
  );
};
