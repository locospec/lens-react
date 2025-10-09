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

import ShadcnAllOfRenderer, {
  shadcnAllOfControlTester,
} from "./shadcn-all-of-renderer";
import ShadcnAnyOfRenderer, {
  shadcnAnyOfControlTester,
} from "./shadcn-any-of-renderer";
import ShadcnArrayControlRenderer, {
  shadcnArrayControlTester,
} from "./shadcn-array-control-renderer";
import ShadcnEnumArrayRenderer, {
  shadcnEnumArrayControlTester,
} from "./shadcn-enum-array-renderer";
import ShadcnObjectRenderer, {
  shadcnObjectControlTester,
} from "./shadcn-object-renderer";
import ShadcnOneOfRenderer, {
  shadcnOneOfControlTester,
} from "./shadcn-one-of-renderer";

export {
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
};

// Shadcn Supporting Components
export * from "./shadcn-combinator-properties";
export * from "./shadcn-delete-dialog";
export * from "./shadcn-tab-switch-confirm-dialog";
export * from "./shadcn-table-control";
export * from "./shadcn-table-toolbar";
export * from "./shadcn-validation-icon";

import ShadcnNoBorderTableCell from "./shadcn-no-border-table-cell";
export { ShadcnNoBorderTableCell };
