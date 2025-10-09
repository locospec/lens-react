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
  Category,
  deriveLabelForUISchemaElement,
  isVisible,
  RankedTester,
  rankWith,
  StatePropsOfLayout,
  Tester,
  UISchemaElement,
  uiTypeIs,
} from "@jsonforms/core";
import {
  TranslateProps,
  withJsonFormsLayoutProps,
  withTranslateProps,
} from "@jsonforms/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lens2/shadcn/components/ui/tabs";
import { useMemo, useState } from "react";
import {
  AjvProps,
  ShadcnLayoutRenderer,
  ShadcnLayoutRendererProps,
  withAjvProps,
} from "../util/layout";

export const isSingleLevelCategorization: Tester = and(
  uiTypeIs("Categorization"),
  (uischema: UISchemaElement): boolean => {
    const categorization = uischema as Categorization;

    return (
      categorization.elements &&
      categorization.elements.reduce(
        (acc, e) => acc && e.type === "Category",
        true
      )
    );
  }
);

export const shadcnCategorizationTester: RankedTester = rankWith(
  1,
  isSingleLevelCategorization
);
export interface CategorizationState {
  activeCategory: number;
}

export interface ShadcnCategorizationLayoutRendererProps
  extends StatePropsOfLayout,
    AjvProps,
    TranslateProps {
  selected?: number;
  ownState?: boolean;
  data?: any;
  onChange?(selected: number, prevSelected: number): void;
}

export const ShadcnCategorizationLayoutRenderer = (
  props: ShadcnCategorizationLayoutRendererProps
) => {
  const {
    data,
    path,
    renderers,
    cells,
    schema,
    uischema,
    visible,
    enabled,
    selected,
    onChange,
    ajv,
    t,
  } = props;
  const categorization = uischema as Categorization;
  const [previousCategorization, setPreviousCategorization] =
    useState<Categorization>(uischema as Categorization);
  const [activeCategory, setActiveCategory] = useState<number>(selected ?? 0);
  const categories = useMemo(
    () =>
      categorization.elements.filter((category: Category) =>
        isVisible(category, data, undefined, ajv)
      ),
    [categorization, data, ajv]
  );

  if (categorization !== previousCategorization) {
    setActiveCategory(0);
    setPreviousCategorization(categorization);
  }

  const safeCategory =
    activeCategory >= categorization.elements.length ? 0 : activeCategory;

  const childProps: ShadcnLayoutRendererProps = {
    elements: categories[safeCategory] ? categories[safeCategory].elements : [],
    schema,
    path,
    direction: "column",
    enabled,
    visible,
    renderers,
    cells,
  };
  const onTabChange = (value: string) => {
    const newValue = parseInt(value);
    if (onChange) {
      onChange(newValue, safeCategory);
    }
    setActiveCategory(newValue);
  };

  const tabLabels = useMemo(() => {
    return categories.map((e: Category) => deriveLabelForUISchemaElement(e, t));
  }, [categories, t]);

  if (!visible) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Tabs value={safeCategory.toString()} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          {categories.map((_, idx: number) => (
            <TabsTrigger key={idx} value={idx.toString()}>
              {tabLabels[idx]}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((_, idx: number) => (
          <TabsContent key={idx} value={idx.toString()}>
            <ShadcnLayoutRenderer {...childProps} key={safeCategory} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default withAjvProps(
  withTranslateProps(
    withJsonFormsLayoutProps(ShadcnCategorizationLayoutRenderer)
  )
);
