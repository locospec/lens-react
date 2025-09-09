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
  MaterialLabelRenderer,
  materialLabelRendererTester,
  MaterialListWithDetailRenderer,
  materialListWithDetailTester,
} from "./additional";
import {
  MaterialBooleanCell,
  materialBooleanCellTester,
  MaterialBooleanToggleCell,
  materialBooleanToggleCellTester,
  MaterialDateCell,
  materialDateCellTester,
  MaterialEnumCell,
  materialEnumCellTester,
  MaterialIntegerCell,
  materialIntegerCellTester,
  MaterialNumberCell,
  materialNumberCellTester,
  MaterialNumberFormatCell,
  materialNumberFormatCellTester,
  MaterialOneOfEnumCell,
  materialOneOfEnumCellTester,
  MaterialTextCell,
  materialTextCellTester,
  MaterialTimeCell,
  materialTimeCellTester,
} from "./cells";
import {
  materialAllOfControlTester,
  MaterialAllOfRenderer,
  materialAnyOfControlTester,
  MaterialAnyOfRenderer,
  MaterialArrayControlRenderer,
  materialArrayControlTester,
  MaterialEnumArrayRenderer,
  materialEnumArrayRendererTester,
  materialObjectControlTester,
  MaterialObjectRenderer,
  materialOneOfControlTester,
  MaterialOneOfRenderer,
} from "./complex";
import {
  ShadcnAnyOfStringOrEnumControl,
  shadcnAnyOfStringOrEnumControlTester,
  ShadcnBooleanControl,
  shadcnBooleanControlTester,
  ShadcnBooleanToggleControl,
  shadcnBooleanToggleControlTester,
  ShadcnDateControl,
  shadcnDateControlTester,
  ShadcnDateTimeControl,
  shadcnDateTimeControlTester,
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
  MaterialArrayLayout,
  materialArrayLayoutTester,
  MaterialCategorizationLayout,
  materialCategorizationTester,
  MaterialGroupLayout,
  materialGroupTester,
  MaterialHorizontalLayout,
  materialHorizontalLayoutTester,
  MaterialVerticalLayout,
  materialVerticalLayoutTester,
} from "./layouts";
import MaterialCategorizationStepperLayout, {
  materialCategorizationStepperTester,
} from "./layouts/material-categorization-stepper-layout";

export * from "./additional";
export * from "./cells";
export * from "./complex";
export * from "./controls";
export * from "./layouts";
export * from "./shadcn-controls";
export * from "./util";

export const materialRenderers: JsonFormsRendererRegistryEntry[] = [
  // controls
  {
    tester: materialArrayControlTester,
    renderer: MaterialArrayControlRenderer,
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
  { tester: materialObjectControlTester, renderer: MaterialObjectRenderer },
  { tester: materialAllOfControlTester, renderer: MaterialAllOfRenderer },
  { tester: materialAnyOfControlTester, renderer: MaterialAnyOfRenderer },
  { tester: materialOneOfControlTester, renderer: MaterialOneOfRenderer },
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
  // layouts
  { tester: materialGroupTester, renderer: MaterialGroupLayout },
  {
    tester: materialHorizontalLayoutTester,
    renderer: MaterialHorizontalLayout,
  },
  { tester: materialVerticalLayoutTester, renderer: MaterialVerticalLayout },
  {
    tester: materialCategorizationTester,
    renderer: MaterialCategorizationLayout,
  },
  {
    tester: materialCategorizationStepperTester,
    renderer: MaterialCategorizationStepperLayout,
  },
  { tester: materialArrayLayoutTester, renderer: MaterialArrayLayout },
  // additional
  { tester: materialLabelRendererTester, renderer: MaterialLabelRenderer },
  {
    tester: materialListWithDetailTester,
    renderer: MaterialListWithDetailRenderer,
  },
  {
    tester: shadcnAnyOfStringOrEnumControlTester,
    renderer: ShadcnAnyOfStringOrEnumControl,
  },
  {
    tester: materialEnumArrayRendererTester,
    renderer: MaterialEnumArrayRenderer,
  },
];

export const materialCells: JsonFormsCellRendererRegistryEntry[] = [
  { tester: materialBooleanCellTester, cell: MaterialBooleanCell },
  { tester: materialBooleanToggleCellTester, cell: MaterialBooleanToggleCell },
  { tester: materialDateCellTester, cell: MaterialDateCell },
  { tester: materialEnumCellTester, cell: MaterialEnumCell },
  { tester: materialIntegerCellTester, cell: MaterialIntegerCell },
  { tester: materialNumberCellTester, cell: MaterialNumberCell },
  { tester: materialNumberFormatCellTester, cell: MaterialNumberFormatCell },
  { tester: materialOneOfEnumCellTester, cell: MaterialOneOfEnumCell },
  { tester: materialTextCellTester, cell: MaterialTextCell },
  { tester: materialTimeCellTester, cell: MaterialTimeCell },
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
