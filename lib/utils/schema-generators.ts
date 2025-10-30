import { FORM_CONFIG } from "@lens2/forms/renderers/shared/form-constants";
import type { JsonSchema, MutatorAttribute, UiSchema } from "@lens2/types/form";
/**
 * Generate JSON schema from enriched mutator attributes
 */
export function generateJsonSchema(
  enrichedAttributes: Record<string, MutatorAttribute>,
  displayKeys?: Record<string, any>,
  prefillMapping?: Record<string, any>,
  defaultValues?: Record<string, any>,
  autoCreateConfig?: Record<string, any>,
  conditionalFields?: Record<string, any>,
  dependencyMap?: Record<string, any>
): JsonSchema {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  Object.entries(enrichedAttributes).forEach(([key, attribute]) => {
    // Attributes are already filtered by enrichFormAttributes, so we can use validationRules.required directly
    if (attribute.validationRules?.required) {
      required.push(key);
    }

    // Generate property based on attribute type
    const property: any = {
      type: mapAttributeTypeToJsonSchemaType(attribute.type),
    };

    // Add format for specific types
    if (attribute.type === "timestamp") {
      // TODORajesh: Currently we support date-time fromat. Other format: date, time.
      // "format": "date-time",
      // "dateTimeFormat": "DD-MM-YY hh:mm:a",
      // "dateTimeSaveFormat": "YYYY/MM/DD h:mm a",
      // "ampm": true,
      // "clearLabel": "Clear it!",
      // "cancelLabel": "Abort",
      // "okLabel": "Do it"

      // We may move this to the ui schema based invocation.
      // Note: The format in which the time is saved in the data. Note that if you specify a format which is
      // incompatible with JSON Schema's "time" format then you should use the UI Schema based invocation,
      // otherwise the control will be marked with an error.
      property.format = "date-time";
      // property.dateTimeFormat = "DD-MM-YY hh:mm:a";
      // property.dateTimeSaveFormat = "YYYY/MM/DD h:mm a";
    }

    // Add related model info for foreign keys
    if (attribute.relatedModelName) {
      property.relatedModelName = attribute.relatedModelName;
      if (autoCreateConfig?.[key]) {
        property.autoCreate = autoCreateConfig?.[key];
      }
    }

    // Add options for specific field types
    if (attribute.options) {
      property.oneOf = attribute.options;
    }

    properties[key] = property;
  });

  return {
    type: "object",
    properties,
    required,
  };
}

/**
 * Generate UI schema from enriched mutator attributes
 */
export function generateUiSchema(
  enrichedAttributes: Record<string, MutatorAttribute>,
  displayKeys?: Record<string, any>,
  prefillMapping?: Record<string, any>,
  defaultValues?: Record<string, any>,
  autoCreateConfig?: Record<string, any>,
  conditionalFields?: Record<string, any>,
  dependencyMap?: Record<string, any>
): UiSchema {
  const elements: any[] = [];

  Object.entries(enrichedAttributes).forEach(([key, attribute]) => {
    // Attributes are already filtered by enrichFormAttributes, so no need to skip here

    const element: any = {
      type: mapAttributeTypeToUiSchemaType(attribute),
      scope: `#/properties/${key}`,
      label: attribute.label,
    };

    // Add options for specific field types
    if (attribute.relatedModelName) {
      element.options = {
        relatedModelName: attribute.relatedModelName,
        labelField: displayKeys?.[key]?.label,
        valueField: displayKeys?.[key]?.value,
        prefillMapping: prefillMapping?.[key],
      };
      if (autoCreateConfig?.[key]) {
        element.options.autoCreate = autoCreateConfig?.[key];
      }

      if (dependencyMap?.[key]) {
        element.options.dependencies = dependencyMap[key];
      }
    }

    if (conditionalFields?.[key]) {
      const condition = conditionalFields[key];
      element.rule = {
        effect: condition.effect,
        condition: {
          scope: `#/properties/${condition.field}`,
          schema: {
            const: condition.value,
          },
        },
      };
    }

    elements.push(element);
  });

  const uiSchema = {
    type: "VerticalLayout", // TODORajesh: Make this dynamic
    elements,
    options: {
      rowSpacing: FORM_CONFIG.ROW_SPACING, // TODORajesh: Figure out how to generate spacing and accordingly add here
    },
  };

  return uiSchema;
}

/**
 * Map attribute type to JSON schema type
 */
function mapAttributeTypeToJsonSchemaType(attributeType: string): string {
  switch (attributeType) {
    case "string":
    case "uuid":
      return "string";
    case "integer":
      return "integer";
    case "number":
    case "decimal":
    case "float":
      return "number";
    case "boolean":
      return "boolean";
    case "timestamp":
    case "datetime":
      return "string";
    case "date":
      return "string";
    case "time":
      return "string";
    default:
      return "string";
  }
}

/**
 * Map attribute type to UI schema type
 */
function mapAttributeTypeToUiSchemaType(attribute: MutatorAttribute): string {
  // TODORajesh: Everything will be control type for the ui schema,
  // We will need to handle the dynamic option based on the api(Maybe inside component itself)

  // If it has relatedModelName, it's a dropdown/select
  // if (attribute.relatedModelName) {
  //   return "lens-dropdown";
  // }

  // Map attribute types to UI schema types
  switch (attribute.type) {
    case "string":
    case "uuid":
      return "Control";
    case "integer":
    case "number":
    case "decimal":
    case "float":
      return "Control";
    case "boolean":
      return "Control";
    case "timestamp":
    case "datetime":
      return "Control";
    case "date":
      return "Control";
    case "time":
      return "Control";
    default:
      return "Control";
  }
}
