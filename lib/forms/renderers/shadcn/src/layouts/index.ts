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
import ShadcnArrayLayout, {
  shadcnArrayLayoutTester,
} from "./shadcn-array-layout-renderer";
import ShadcnCategorizationLayout, {
  shadcnCategorizationTester,
} from "./shadcn-categorization-layout";
import ExpandPanelRenderer, {
  ctxDispatchToExpandPanelProps,
  withContextToExpandPanelProps,
  withJsonFormsExpandPanelProps,
} from "./shadcn-expand-panel-renderer";
import ShadcnGroupLayout, { shadcnGroupTester } from "./shadcn-group-layout";
import ShadcnHorizontalLayout, {
  shadcnHorizontalLayoutTester,
} from "./shadcn-horizontal-layout";
import ShadcnVerticalLayout, {
  shadcnVerticalLayoutTester,
} from "./shadcn-vertical-layout";

export {
  ctxDispatchToExpandPanelProps,
  ExpandPanelRenderer,
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
  withContextToExpandPanelProps,
  withJsonFormsExpandPanelProps,
};

export * from "./shadcn-array-toolbar";
