import type { MutatorAttribute } from "@lens2/types/form";
import * as logger from "@lens2/utils/logger";

/**
 * Transform static options from backend format to frontend format
 * Backend format: { title: "Pending", const: "pending" }
 * Frontend format: { label: "Pending", value: "pending" }
 * Only includes options that have both const and title properties
 */
function transformStaticOptions(
  backendOptions:
    | Array<{ title?: string; const?: string; id?: string }>
    | undefined
): Array<{ title: string; const: string }> {
  if (!backendOptions) return [];

  return backendOptions
    .filter(option => option.const && option.title)
    .map(option => ({
      title: option.title!,
      const: option.const!,
    }));
}

/**
 * Determine if an attribute should be included in the form
 * Excludes system-generated fields and deleted fields
 */
function shouldIncludeInForm(
  attr: MutatorAttribute,
  attrName: string
): boolean {
  // Skip system-generated fields
  if (attr.generators && attr.generators.length > 0) {
    // Check if all generators are system-generated (uuid, datetime, unique_slug)
    const systemGenerators = ["uuid", "datetime", "unique_slug"];
    const allSystemGenerated = attr.generators.every(gen =>
      systemGenerators.includes(gen.type)
    );

    if (allSystemGenerated) {
      logger.debug(`Skipping system-generated attribute: ${attrName}`);
      return false;
    }
  }

  // Skip delete key fields
  if (attr.deleteKey) {
    logger.debug(`Skipping delete key attribute: ${attrName}`);
    return false;
  }

  // Skip primary key fields for create operations (they're auto-generated)
  if (attr.primaryKey) {
    logger.debug(`Skipping primary key attribute: ${attrName}`);
    return false;
  }

  return true;
}

/**
 * Get field validation rules from validators
 */
function getValidationRules(attr: MutatorAttribute): Record<string, any> {
  const rules: Record<string, any> = {};

  if (!attr.validators) return rules;

  attr.validators.forEach(validator => {
    switch (validator.type) {
      case "required":
        if (
          validator.operations?.includes("insert") ||
          validator.operations?.includes("update")
        ) {
          rules.required = true;
        }
        break;
      case "min":
        if (validator.value !== undefined) {
          rules.min = validator.value;
        }
        break;
      case "max":
        if (validator.value !== undefined) {
          rules.max = validator.value;
        }
        break;
      case "min_length":
        if (validator.value !== undefined) {
          rules.minLength = validator.value;
        }
        break;
      case "max_length":
        if (validator.value !== undefined) {
          rules.maxLength = validator.value;
        }
        break;
      case "pattern":
        if (validator.value) {
          rules.pattern = validator.value;
        }
        break;
      case "email":
        rules.email = true;
        break;
      case "url":
        rules.url = true;
        break;
    }
  });

  return rules;
}

/**
 * Enrich attributes for form generation
 *
 * This function takes mutator attributes from the backend and enriches them
 * with form-specific properties like:
 * - Form field type determination
 * - Required field detection
 * - Validation rules extraction
 * - Static options transformation
 * - Field inclusion/exclusion logic
 */
export function enrichFormAttributes(
  attributes: Record<string, MutatorAttribute>,
  operation: "create" | "update" = "create"
): Record<string, MutatorAttribute> {
  const enriched: Record<string, MutatorAttribute> = {};

  Object.entries(attributes).forEach(([attrName, attr]) => {
    // Skip attributes that shouldn't be in the form
    if (!shouldIncludeInForm(attr, attrName)) {
      return;
    }

    // Transform static options from backend format to frontend format
    let transformedOptions = attr.options;
    const hasStaticOptions = attr.options && attr.options.length > 0;

    if (hasStaticOptions) {
      logger.debug(`Transforming options for form attribute "${attrName}"`, {
        originalOptions: attr.options,
        originalType: attr.type,
      });
      transformedOptions = transformStaticOptions(attr.options as any);
      logger.debug(`Transformed options for form attribute "${attrName}"`, {
        transformedOptions,
        transformedCount: transformedOptions?.length || 0,
      });
    }

    // Determine form-specific properties
    const validationRules = getValidationRules(attr);

    // Create the enriched attribute
    const enrichedAttribute: MutatorAttribute = {
      ...attr,
      name: attrName, // Ensure name property is set
      options: transformedOptions,
      // Add form-specific properties
      validationRules,
      // Add operation context
      operation,
    };

    // Return enriched attribute
    enriched[attrName] = enrichedAttribute;
  });

  logger.debug("Enriched form attributes", enriched);

  return enriched;
}

/**
 * Get form field configuration for a specific attribute
 */
export function getFormFieldConfig(attr: MutatorAttribute) {
  return {
    required: attr.validationRules?.required || false,
    validation: attr.validationRules || {},
    options: attr.options || [],
    relatedModelName: attr.relatedModelName,
    label: attr.label || attr.name,
    placeholder: attr.placeholder || `Enter ${attr.label || attr.name}`,
    helpText: attr.helpText,
    disabled: attr.disabled || false,
  };
}
