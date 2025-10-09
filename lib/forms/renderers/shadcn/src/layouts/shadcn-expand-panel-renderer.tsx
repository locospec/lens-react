// @ts-nocheck
import {
  ArrayTranslations,
  composePaths,
  computeChildLabel,
  ControlElement,
  createId,
  findUISchema,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  moveDown,
  moveUp,
  removeId,
  update,
  UpdateArrayContext,
} from "@jsonforms/core";
import {
  JsonFormsDispatch,
  JsonFormsStateContext,
  withJsonFormsContext,
} from "@jsonforms/react";
import { Avatar, AvatarFallback } from "@lens2/shadcn/components/ui/avatar";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@lens2/shadcn/components/ui/collapsible";
import merge from "lodash/merge";
import { ChevronDown } from "lucide-react";
import React, {
  ComponentType,
  Dispatch,
  Fragment,
  ReducerAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Grid } from "../components";

interface OwnPropsOfExpandPanel {
  enabled: boolean;
  index: number;
  path: string;
  uischema: ControlElement;
  schema: JsonSchema;
  expanded: boolean;
  renderers?: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
  uischemas?: JsonFormsUISchemaRegistryEntry[];
  rootSchema: JsonSchema;
  enableMoveUp: boolean;
  enableMoveDown: boolean;
  config: any;
  childLabelProp?: string;
  handleExpansion(panel: string): (event: any, expanded: boolean) => void;
  translations: ArrayTranslations;
  disableRemove?: boolean;
}

interface StatePropsOfExpandPanel extends OwnPropsOfExpandPanel {
  childLabel: string;
  childPath: string;
  enableMoveUp: boolean;
  enableMoveDown: boolean;
}

/**
 * Dispatch props of a table control
 */
export interface DispatchPropsOfExpandPanel {
  removeItems(path: string, toDelete: number[]): (event: any) => void;
  moveUp(path: string, toMove: number): (event: any) => void;
  moveDown(path: string, toMove: number): (event: any) => void;
}

export interface ExpandPanelProps
  extends StatePropsOfExpandPanel,
    DispatchPropsOfExpandPanel {}

const ShadcnExpandPanelRendererComponent = (props: ExpandPanelProps) => {
  const [labelHtmlId] = useState<string>(createId("expand-panel"));

  useEffect(() => {
    return () => {
      removeId(labelHtmlId);
    };
  }, [labelHtmlId]);

  const {
    enabled,
    childLabel,
    childPath,
    index,
    expanded,
    moveDown,
    moveUp,
    enableMoveDown,
    enableMoveUp,
    handleExpansion,
    removeItems,
    path,
    rootSchema,
    schema,
    uischema,
    uischemas,
    renderers,
    cells,
    config,
    translations,
    disableRemove,
  } = props;

  const foundUISchema = useMemo(
    () =>
      findUISchema(
        uischemas,
        schema,
        uischema.scope,
        path,
        undefined,
        uischema,
        rootSchema
      ),
    [uischemas, schema, uischema.scope, path, uischema, rootSchema]
  );

  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const showSortButtons =
    appliedUiSchemaOptions.showSortButtons ||
    appliedUiSchemaOptions.showArrayLayoutSortButtons;

  return (
    <Collapsible
      open={expanded}
      onOpenChange={open => handleExpansion(childPath)(null, open)}
      className="rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <div className="hover:bg-muted/50 p-4 transition-colors">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {index + 1}
                  </AvatarFallback>
                </Avatar>
              </Grid>
              <Grid>
                <span id={labelHtmlId} className="font-medium">
                  {childLabel}
                </span>
              </Grid>
            </Grid>
            <Grid container alignItems="center" spacing={1}>
              {showSortButtons && enabled && (
                <Fragment>
                  <Grid>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={moveUp(path, index)}
                      disabled={!enableMoveUp}
                      className="h-8 w-8 p-0"
                    >
                      ↑
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={moveDown(path, index)}
                      disabled={!enableMoveDown}
                      className="h-8 w-8 p-0"
                    >
                      ↓
                    </Button>
                  </Grid>
                </Fragment>
              )}
              {enabled && !disableRemove && (
                <Grid>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeItems(path, [index])}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </Grid>
              )}
              <Grid>
                <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </Grid>
            </Grid>
          </Grid>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <JsonFormsDispatch
          enabled={enabled}
          schema={schema}
          uischema={foundUISchema}
          path={childPath}
          key={childPath}
          renderers={renderers}
          cells={cells}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ShadcnExpandPanelRenderer = React.memo(
  ShadcnExpandPanelRendererComponent
);

/**
 * Maps state to dispatch properties of an expand pandel control.
 *
 * @param dispatch the store's dispatch method
 * @returns {DispatchPropsOfArrayControl} dispatch props of an expand panel control
 */
export const ctxDispatchToExpandPanelProps: (
  dispatch: Dispatch<ReducerAction<any>>
) => DispatchPropsOfExpandPanel = dispatch => ({
  removeItems: useCallback(
    (path: string, toDelete: number[]) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(
            path,
            array => {
              toDelete
                .sort()
                .reverse()
                .forEach(s => array.splice(s, 1));
              return array;
            },
            { type: "REMOVE", indices: toDelete } as UpdateArrayContext
          )
        );
      },
    [dispatch]
  ),
  moveUp: useCallback(
    (path: string, toMove: number) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(
            path,
            array => {
              moveUp(array, toMove);
              return array;
            },
            {
              type: "MOVE",
              moves: [{ from: toMove, to: toMove - 1 }],
            } as UpdateArrayContext
          )
        );
      },
    [dispatch]
  ),
  moveDown: useCallback(
    (path: string, toMove: number) =>
      (event: any): void => {
        event.stopPropagation();
        dispatch(
          update(
            path,
            array => {
              moveDown(array, toMove);
              return array;
            },
            {
              type: "MOVE",
              moves: [{ from: toMove, to: toMove + 1 }],
            } as UpdateArrayContext
          )
        );
      },
    [dispatch]
  ),
});

/**
 * Map state to control props.
 * @param state the JSON Forms state
 * @param ownProps any own props
 * @returns {StatePropsOfControl} state props for a control
 */
export const withContextToExpandPanelProps = (
  Component: ComponentType<ExpandPanelProps>
): ComponentType<{
  ctx: JsonFormsStateContext;
  props: OwnPropsOfExpandPanel;
}> => {
  return function WithContextToExpandPanelProps({
    ctx,
    props,
  }: {
    ctx: JsonFormsStateContext;
    props: ExpandPanelProps;
  }) {
    const dispatchProps = ctxDispatchToExpandPanelProps(ctx.dispatch);
    const {
      // eslint is unable to detect that these props are "checked" via Typescript already
      // eslint-disable-next-line react/prop-types
      childLabelProp,
      // eslint-disable-next-line react/prop-types
      schema,
      // eslint-disable-next-line react/prop-types
      uischema,
      // eslint-disable-next-line react/prop-types
      rootSchema,
      // eslint-disable-next-line react/prop-types
      path,
      // eslint-disable-next-line react/prop-types
      index,
      // eslint-disable-next-line react/prop-types
      uischemas,
    } = props;
    const childPath = composePaths(path, `${index}`);

    const childLabel = useMemo(() => {
      return computeChildLabel(
        ctx.core.data,
        childPath,
        childLabelProp,
        schema,
        rootSchema,
        ctx.i18n.translate,
        uischema
      );
    }, [
      ctx.core.data,
      childPath,
      childLabelProp,
      schema,
      rootSchema,
      ctx.i18n.translate,
      uischema,
    ]);

    return (
      <Component
        {...props}
        {...dispatchProps}
        childLabel={childLabel}
        childPath={childPath}
        uischemas={uischemas}
      />
    );
  };
};

export const withJsonFormsExpandPanelProps = (
  Component: ComponentType<ExpandPanelProps>
): ComponentType<OwnPropsOfExpandPanel> =>
  withJsonFormsContext(withContextToExpandPanelProps(Component));

export default withJsonFormsExpandPanelProps(ShadcnExpandPanelRenderer);
