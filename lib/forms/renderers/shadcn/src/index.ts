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
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
} from "@jsonforms/core";
import {
  ShadcnLabelRenderer,
  shadcnLabelRendererTester,
  ShadcnListWithDetailRenderer,
  shadcnListWithDetailTester,
} from "./additional";
import {
  ShadcnBooleanCell,
  shadcnBooleanCellTester,
  ShadcnBooleanToggleCell,
  shadcnBooleanToggleCellTester,
  ShadcnDateCell,
  shadcnDateCellTester,
  ShadcnEnumCell,
  shadcnEnumCellTester,
  ShadcnIntegerCell,
  shadcnIntegerCellTester,
  ShadcnNumberCell,
  shadcnNumberCellTester,
  ShadcnNumberFormatCell,
  shadcnNumberFormatCellTester,
  ShadcnOneOfEnumCell,
  shadcnOneOfEnumCellTester,
  ShadcnTextCell,
  shadcnTextCellTester,
  ShadcnTimeCell,
  shadcnTimeCellTester,
} from "./cells";
import {
  shadcnAllOfControlTester,
  ShadcnAllOfRenderer,
  shadcnAnyOfControlTester,
  ShadcnAnyOfRenderer,
  ShadcnArrayControlRenderer,
  shadcnArrayControlTester,
  shadcnEnumArrayControlTester,
  ShadcnEnumArrayRenderer,
  shadcnObjectControlTester,
  ShadcnObjectRenderer,
  shadcnOneOfControlTester,
  ShadcnOneOfRenderer,
} from "./complex";
import {
  ShadcnAnyOfStringOrEnumControl,
  shadcnAnyOfStringOrEnumControlTester,
  ShadcnApiAutocompleteControl,
  shadcnApiAutocompleteControlTester,
  ShadcnBooleanControl,
  shadcnBooleanControlTester,
  ShadcnBooleanToggleControl,
  shadcnBooleanToggleControlTester,
  ShadcnDateControl,
  shadcnDateControlTester,
  ShadcnDateTimeControl,
  shadcnDateTimeControlTester,
  ShadcnDynamicSelectControl,
  shadcnDynamicSelectControlTester,
  ShadcnEnumControl,
  shadcnEnumControlTester,
  ShadcnIntegerControl,
  shadcnIntegerControlTester,
  ShadcnNativeControl,
  shadcnNativeControlTester,
  ShadcnNumberControl,
  shadcnNumberControlTester,
  ShadcnOneOfEnumControl,
  shadcnOneOfEnumControlTester,
  ShadcnOneOfRadioGroupControl,
  shadcnOneOfRadioGroupControlTester,
  ShadcnRadioGroupControl,
  shadcnRadioGroupControlTester,
  ShadcnSliderControl,
  shadcnSliderControlTester,
  ShadcnTextControl,
  shadcnTextControlTester,
  ShadcnTimeControl,
  shadcnTimeControlTester,
} from "./controls";
import {
  ShadcnArrayLayout,
  shadcnArrayLayoutTester,
  ShadcnCategorizationLayout,
  shadcnCategorizationTester,
  ShadcnGroupLayout,
  shadcnGroupTester,
  ShadcnHorizontalLayout,
  shadcnHorizontalLayoutTester,
  ShadcnVerticalLayout,
  shadcnVerticalLayoutTester,
} from "./layouts";
import ShadcnCategorizationStepperLayout, {
  shadcnCategorizationStepperTester,
} from "./layouts/shadcn-categorization-stepper-layout";

export * from "./additional";
export * from "./cells";
export * from "./complex";
export * from "./controls";
export * from "./layouts";
export * from "./shadcn-controls";
export * from "./util";

export const shadcnRenderers: JsonFormsRendererRegistryEntry[] = [
  // controls
  {
    tester: shadcnArrayControlTester,
    renderer: ShadcnArrayControlRenderer,
  },
  { tester: shadcnBooleanControlTester, renderer: ShadcnBooleanControl },
  {
    tester: shadcnBooleanToggleControlTester,
    renderer: ShadcnBooleanToggleControl,
  },
  { tester: shadcnNativeControlTester, renderer: ShadcnNativeControl },
  { tester: shadcnEnumControlTester, renderer: ShadcnEnumControl },
  { tester: shadcnIntegerControlTester, renderer: ShadcnIntegerControl },
  { tester: shadcnNumberControlTester, renderer: ShadcnNumberControl },
  { tester: shadcnTextControlTester, renderer: ShadcnTextControl },
  { tester: shadcnDateTimeControlTester, renderer: ShadcnDateTimeControl },
  { tester: shadcnDateControlTester, renderer: ShadcnDateControl },
  { tester: shadcnSliderControlTester, renderer: ShadcnSliderControl },
  { tester: shadcnTimeControlTester, renderer: ShadcnTimeControl },
  { tester: shadcnObjectControlTester, renderer: ShadcnObjectRenderer },
  { tester: shadcnAllOfControlTester, renderer: ShadcnAllOfRenderer },
  { tester: shadcnAnyOfControlTester, renderer: ShadcnAnyOfRenderer },
  { tester: shadcnOneOfControlTester, renderer: ShadcnOneOfRenderer },
  {
    tester: shadcnRadioGroupControlTester,
    renderer: ShadcnRadioGroupControl,
  },
  {
    tester: shadcnOneOfRadioGroupControlTester,
    renderer: ShadcnOneOfRadioGroupControl,
  },
  {
    tester: shadcnOneOfEnumControlTester,
    renderer: ShadcnOneOfEnumControl,
  },
  {
    tester: shadcnDynamicSelectControlTester,
    renderer: ShadcnDynamicSelectControl,
  },
  {
    tester: shadcnApiAutocompleteControlTester,
    renderer: ShadcnApiAutocompleteControl,
  },
  // layouts
  { tester: shadcnGroupTester, renderer: ShadcnGroupLayout },
  {
    tester: shadcnHorizontalLayoutTester,
    renderer: ShadcnHorizontalLayout,
  },
  { tester: shadcnVerticalLayoutTester, renderer: ShadcnVerticalLayout },
  {
    tester: shadcnCategorizationTester,
    renderer: ShadcnCategorizationLayout,
  },
  {
    tester: shadcnCategorizationStepperTester,
    renderer: ShadcnCategorizationStepperLayout,
  },
  { tester: shadcnArrayLayoutTester, renderer: ShadcnArrayLayout },
  // additional
  { tester: shadcnLabelRendererTester, renderer: ShadcnLabelRenderer },
  {
    tester: shadcnListWithDetailTester,
    renderer: ShadcnListWithDetailRenderer,
  },
  {
    tester: shadcnAnyOfStringOrEnumControlTester,
    renderer: ShadcnAnyOfStringOrEnumControl,
  },
  {
    tester: shadcnEnumArrayControlTester,
    renderer: ShadcnEnumArrayRenderer,
  },
];

export const shadcnCells: JsonFormsCellRendererRegistryEntry[] = [
  { tester: shadcnBooleanCellTester, cell: ShadcnBooleanCell },
  { tester: shadcnBooleanToggleCellTester, cell: ShadcnBooleanToggleCell },
  { tester: shadcnDateCellTester, cell: ShadcnDateCell },
  { tester: shadcnEnumCellTester, cell: ShadcnEnumCell },
  { tester: shadcnIntegerCellTester, cell: ShadcnIntegerCell },
  { tester: shadcnNumberCellTester, cell: ShadcnNumberCell },
  { tester: shadcnNumberFormatCellTester, cell: ShadcnNumberFormatCell },
  { tester: shadcnOneOfEnumCellTester, cell: ShadcnOneOfEnumCell },
  { tester: shadcnTextCellTester, cell: ShadcnTextCell },
  { tester: shadcnTimeCellTester, cell: ShadcnTimeCell },
];

import { UnwrappedAdditional } from "./additional/unwrapped";
import { UnwrappedComplex } from "./complex/unwrapped";
import { UnwrappedControls } from "./controls/unwrapped";
import { UnwrappedLayouts } from "./layouts/unwrapped";

export const Unwrapped = {
  ...UnwrappedAdditional,
  ...UnwrappedComplex,
  ...UnwrappedControls,
  ...UnwrappedLayouts,
};
