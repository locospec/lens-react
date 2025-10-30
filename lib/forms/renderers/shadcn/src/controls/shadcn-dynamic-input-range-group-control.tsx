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
import { ControlProps, RankedTester, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { ShadcnDynamicInputRangeGroup } from "./shadcn-dynamic-input-range-group";

export const ShadcnDynamicInputRangeGroupControl = (props: ControlProps) => (
  <ShadcnDynamicInputRangeGroup {...props} />
);

const getLastKeyFromPointer = (pointer: string) => {
  if (typeof pointer !== "string") return null;
  const parts = pointer.split("/"); // split by "/"
  return parts[parts.length - 1] || null; // return last part
};

const testDynamicInputRangeGroup = (
  uiSchema: any,
  schema: any,
  formContext: any
) => {
  let keyName = getLastKeyFromPointer(uiSchema?.scope);

  if (!keyName) return false;

  let customComponent = schema["properties"][keyName]["customComponent"];
  if (!customComponent) return false;

  if (customComponent === "dynamic_input_range_group") {
    return true;
  } else return false;
};

export const shadcnDynamicInputRangeGroupControlTester: RankedTester = rankWith(
  2,
  testDynamicInputRangeGroup
);
export default withJsonFormsControlProps(ShadcnDynamicInputRangeGroupControl);
