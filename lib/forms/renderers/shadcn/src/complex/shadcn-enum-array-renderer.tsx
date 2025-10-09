// @ts-nocheck
import {
  and,
  ControlProps,
  DispatchPropsOfMultiEnumControl,
  hasType,
  isDescriptionHidden,
  JsonSchema,
  OwnPropsOfEnum,
  Paths,
  RankedTester,
  rankWith,
  resolveSchema,
  schemaMatches,
  schemaSubPathMatches,
  showAsRequired,
  uiTypeIs,
} from "@jsonforms/core";

import { withJsonFormsMultiEnumProps } from "@jsonforms/react";
import { Checkbox } from "@lens2/shadcn/components/ui/checkbox";
import { Label } from "@lens2/shadcn/components/ui/label";
import { cn } from "@lens2/shadcn/lib/utils";
import merge from "lodash/merge";
import { useFocus } from "../util";

export const ShadcnEnumArrayRenderer = ({
  config,
  id,
  schema,
  visible,
  errors,
  description,
  label,
  required,
  path,
  options,
  data,
  addItem,
  removeItem,
  handleChange: _handleChange,
  ...otherProps
}: ControlProps & OwnPropsOfEnum & DispatchPropsOfMultiEnumControl) => {
  const [focused, onFocus, onBlur] = useFocus();
  const isValid = errors.length === 0;
  const appliedUiSchemaOptions = merge({}, config, otherProps.uischema.options);
  const showDescription = !isDescriptionHidden(
    visible,
    description,
    focused,
    appliedUiSchemaOptions.showUnfocusedDescription
  );

  if (!visible) {
    return null;
  }

  return (
    <fieldset className="space-y-2" onFocus={onFocus} onBlur={onBlur}>
      <legend
        className={cn("text-sm font-medium", !isValid && "text-destructive")}
      >
        {label}
        {showAsRequired(
          required,
          appliedUiSchemaOptions.hideRequiredAsterisk
        ) && <span className="text-destructive">*</span>}
      </legend>
      <div className="space-y-2">
        {options.map((option: any, index: number) => {
          const optionPath = Paths.compose(path, `${index}`);
          const checkboxValue = data?.includes(option.value)
            ? option.value
            : undefined;
          const isChecked = data?.includes(option.value) ?? false;

          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-${option.value}`}
                checked={isChecked}
                onCheckedChange={checked => {
                  if (checked) {
                    addItem(path, option.value)();
                  } else {
                    removeItem(path, option.value)();
                  }
                }}
                disabled={!otherProps.enabled}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <Label
                htmlFor={`${id}-${option.value}`}
                className="cursor-pointer text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      <p
        className={cn(
          "text-sm",
          !isValid ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {!isValid ? errors : showDescription ? description : null}
      </p>
    </fieldset>
  );
};

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean =>
  schema.type === "string" && schema.enum !== undefined;

export const shadcnEnumArrayControlTester: RankedTester = rankWith(
  5,
  and(
    uiTypeIs("Control"),
    and(
      schemaMatches(
        schema =>
          hasType(schema, "array") &&
          !Array.isArray(schema.items) &&
          schema.uniqueItems === true
      ),
      schemaSubPathMatches("items", (schema, rootSchema) => {
        const resolvedSchema = schema.$ref
          ? resolveSchema(rootSchema, schema.$ref, rootSchema)
          : schema;
        return hasOneOfItems(resolvedSchema) || hasEnumItems(resolvedSchema);
      })
    )
  )
);

export default withJsonFormsMultiEnumProps(ShadcnEnumArrayRenderer);
