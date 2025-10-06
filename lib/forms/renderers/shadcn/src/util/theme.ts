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
import React from "react";

// Shadcn theme configuration for JSONForms
export interface ShadcnJsonFormsTheme {
  jsonforms?: {
    input?: {
      delete?: {
        background?: string;
      };
    };
    spacing?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      error?: string;
      warning?: string;
      success?: string;
    };
  };
}

export interface WithInputProps {
  label?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export interface WithSelectProps {
  multiple?: boolean;
}

// Default theme configuration
export const defaultShadcnTheme: ShadcnJsonFormsTheme = {
  jsonforms: {
    spacing: {
      xs: 0.5,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
    },
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      error: "hsl(var(--destructive))",
      warning: "hsl(var(--warning))",
      success: "hsl(var(--success))",
    },
  },
};

export const defaultInputVariant: WithInputProps["variant"] = "outline";

export function useInputVariant(): WithInputProps["variant"] {
  // For shadcn, we'll use the default variant
  // This can be extended to read from a theme context if needed
  return defaultInputVariant;
}

export function useInputComponent(): React.ComponentType<WithInputProps> {
  // For shadcn, we'll return a generic input component
  // This can be extended to return specific shadcn input components
  return React.forwardRef<HTMLInputElement, WithInputProps>((props, ref) => {
    return React.createElement("input", { ref, ...props });
  });
}

export function useShadcnTheme(): ShadcnJsonFormsTheme {
  // Return the default theme for now
  // This can be extended to read from a theme context
  return defaultShadcnTheme;
}
