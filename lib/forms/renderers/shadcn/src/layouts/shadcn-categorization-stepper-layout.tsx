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
  and,
  Categorization,
  categorizationHasCategory,
  Category,
  deriveLabelForUISchemaElement,
  isVisible,
  optionIs,
  RankedTester,
  rankWith,
  StatePropsOfLayout,
  uiTypeIs,
} from "@jsonforms/core";
import {
  TranslateProps,
  withJsonFormsLayoutProps,
  withTranslateProps,
} from "@jsonforms/react";
import { Button } from "@lens2/shadcn/components/ui/button";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { useMemo, useState } from "react";
import {
  AjvProps,
  ShadcnLayoutRenderer,
  ShadcnLayoutRendererProps,
  withAjvProps,
} from "../util/layout";

export const shadcnCategorizationStepperTester: RankedTester = rankWith(
  2,
  and(
    uiTypeIs("Categorization"),
    categorizationHasCategory,
    optionIs("variant", "stepper")
  )
);

export interface CategorizationStepperState {
  activeCategory: number;
}

export interface ShadcnCategorizationStepperLayoutRendererProps
  extends StatePropsOfLayout,
    AjvProps,
    TranslateProps {
  data: any;
}

export const ShadcnCategorizationStepperLayoutRenderer = (
  props: ShadcnCategorizationStepperLayoutRendererProps
) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const handleStep = (step: number) => {
    setActiveCategory(step);
  };

  const {
    data,
    path,
    renderers,
    schema,
    uischema,
    visible,
    cells,
    config,
    ajv,
    t,
  } = props;
  const categorization = uischema as Categorization;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const categories = useMemo(
    () =>
      categorization.elements.filter((category: Category) =>
        isVisible(category, data, undefined, ajv)
      ),
    [categorization, data, ajv]
  );
  const childProps: ShadcnLayoutRendererProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: "column",
    visible,
    renderers,
    cells,
  };
  const tabLabels = useMemo(() => {
    return categories.map((e: Category) => deriveLabelForUISchemaElement(e, t));
  }, [categories, t]);

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center space-x-4">
        {categories.map((_: Category, idx: number) => (
          <div key={tabLabels[idx]} className="flex items-center">
            <button
              onClick={() => handleStep(idx)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                activeCategory === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {idx + 1}
            </button>
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                activeCategory === idx
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {tabLabels[idx]}
            </span>
            {idx < categories.length - 1 && (
              <div className="bg-border mx-4 h-px w-8" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div>
        <ShadcnLayoutRenderer {...childProps} />
      </div>

      {/* Navigation Buttons */}
      {appliedUiSchemaOptions.showNavButtons && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            disabled={activeCategory <= 0}
            onClick={() => handleStep(activeCategory - 1)}
          >
            Previous
          </Button>
          <Button
            disabled={activeCategory >= categories.length - 1}
            onClick={() => handleStep(activeCategory + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default withAjvProps(
  withTranslateProps(
    withJsonFormsLayoutProps(ShadcnCategorizationStepperLayoutRenderer)
  )
);
