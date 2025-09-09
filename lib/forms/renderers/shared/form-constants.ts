/**
 * Shared Form Configuration Constants
 */

// Form Layout
export const FORM_CONFIG = {
  ROW_SPACING: 2, // Default spacing between form rows
  SUBMIT_BUTTON_WIDTH: 120, // Minimum width for submit button
} as const;

// Form States
export const FORM_STATES = {
  SUBMITTING: "Submitting...",
  SUBMIT: "Save & Submit",
  LOADING: "Loading...",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  SUBMISSION_FAILED: "Submission failed",
  NO_CONFIG: "No form configuration available",
} as const;
