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
import { EnumCellProps, WithClassname } from "@jsonforms/core";
import { TranslateProps } from "@jsonforms/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lens2/shadcn/components/ui/select";
import merge from "lodash/merge";
import React, { useMemo } from "react";
import { i18nDefaults, WithInputProps, WithSelectProps } from "../util";

export const ShadcnSelect = React.memo(function ShadcnSelect(
  props: EnumCellProps &
    WithClassname &
    TranslateProps &
    WithInputProps &
    WithSelectProps
) {
  const {
    data,
    className,
    id,
    enabled,
    schema,
    uischema,
    isValid,
    path,
    handleChange,
    options,
    config,
    label,
    t,
    multiple,
  } = props;

  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const noneOptionLabel = useMemo(
    () => t("enum.none", i18nDefaults["enum.none"], { schema, uischema, path }),
    [t, schema, uischema, path]
  );

  const handleValueChange = (value: string) => {
    handleChange(path, value || undefined);
  };

  return (
    <Select
      value={data !== undefined ? data : ""}
      onValueChange={handleValueChange}
      disabled={!enabled}
    >
      <SelectTrigger className={className} id={id}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
          <em>{noneOptionLabel}</em>
        </SelectItem>
        {options?.map(optionValue => (
          <SelectItem value={optionValue.value} key={optionValue.value}>
            {optionValue.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
