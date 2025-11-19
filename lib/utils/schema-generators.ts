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
  dependencyMap?: Record<string, any>,
  jsonFromOptions?: Record<string, any>
): JsonSchema {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  // add extra fields to the properties
  if (jsonFromOptions?.extra_fields) {
    Object.entries(jsonFromOptions.extra_fields).forEach(([key, value]) => {
      const fieldValue = value as {
        type: string;
        label: string;
        required: boolean;
      };
      properties[key] = {
        type: mapAttributeTypeToJsonSchemaType(fieldValue.type),
      };

      if (fieldValue.required) {
        required.push(key);
      }
    });
  }

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

    if (attribute?.customComponent) {
      property.customComponent = attribute.customComponent;
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
  dependencyMap?: Record<string, any>,
  jsonFromOptions?: Record<string, any>
): UiSchema {
  const elements: any[] = [];

  // add extra fields to the elements
  if (jsonFromOptions?.extra_fields) {
    Object.entries(jsonFromOptions.extra_fields).forEach(([key, value]) => {
      const fieldValue = value as { type: string; label: string };
      elements.push({
        type: "Control",
        scope: `#/properties/${key}`,
        label: fieldValue.label,
      });
    });
  }

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
          schema: Array.isArray(condition.value)
            ? { enum: condition.value }
            : { const: condition.value },
        },
      };
    }

    if (jsonFromOptions?.[key]) {
      if (jsonFromOptions?.[key]?.multi) {
        element.options = {
          ...element.options,
          multi: jsonFromOptions?.[key]?.multi,
        };
      }
    }

    elements.push(element);
  });

  // Create a proper two-column layout using JSON Forms nested layout system
  // This approach groups elements in pairs to maintain alignment
  const layoutElements: any[] = [];

  // Group elements in pairs: [0,1], [2,3], [4,5], etc.
  for (let i = 0; i < elements.length; i += 2) {
    const leftElement = elements[i];
    const rightElement = elements[i + 1];

    if (rightElement) {
      // Create a horizontal row with two elements
      layoutElements.push({
        type: "HorizontalLayout",
        elements: [leftElement, rightElement],
        options: {
          columnSpacing: 16,
        },
      });
    } else {
      // If odd number of elements, add the last one as a single element
      layoutElements.push(leftElement);
    }
  }

  const uiSchema = {
    type: "VerticalLayout",
    elements: layoutElements,
    options: {
      rowSpacing: FORM_CONFIG.ROW_SPACING,
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
