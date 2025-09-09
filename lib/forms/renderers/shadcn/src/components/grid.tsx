import { cn } from "@lens2/shadcn/lib/utils";
import * as React from "react";

// Breakpoint types
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

// Size can be a number (1-12), "grow", or responsive object
export type GridSize =
  | number
  | "grow"
  | Partial<Record<Breakpoint, number | "grow">>;

// Offset can be a number, "auto", or responsive object
export type GridOffset =
  | number
  | "auto"
  | Partial<Record<Breakpoint, number | "auto">>;

// Spacing can be a number or responsive object
export type GridSpacing = number | Partial<Record<Breakpoint, number>>;

// Direction for container
export type GridDirection = "row" | "column" | "row-reverse" | "column-reverse";

// Base props for both container and item
interface BaseGridProps {
  className?: string;
  children?: React.ReactNode;
}

// Container-specific props
interface GridContainerProps extends BaseGridProps {
  container: true;
  spacing?: GridSpacing;
  rowSpacing?: GridSpacing;
  columnSpacing?: GridSpacing;
  direction?: GridDirection;
  columns?: number;
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
}

// Item-specific props
interface GridItemProps extends BaseGridProps {
  container?: false;
  size?: GridSize;
  offset?: GridOffset;
  display?: "flex" | "inline-flex" | "block" | "inline-block" | "none";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
}

// Union type for all Grid props
export type GridProps = GridContainerProps | GridItemProps;

// Utility function to generate responsive classes
const generateResponsiveClasses = (
  value:
    | number
    | "grow"
    | Partial<Record<Breakpoint, number | "grow">>
    | undefined,
  prefix: string,
  isGrow = false
): string => {
  if (value === undefined) return "";

  if (typeof value === "number") {
    if (isGrow) {
      return `${prefix}-${value}`;
    }
    // For grid sizes, convert to percentage-based flex
    const percentage = (value / 12) * 100;
    return `${prefix}-[${percentage}%]`;
  }

  if (value === "grow") {
    return "flex-1";
  }

  if (typeof value === "object") {
    const classes: string[] = [];
    const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

    breakpoints.forEach(breakpoint => {
      const breakpointValue = value[breakpoint];
      if (breakpointValue !== undefined) {
        if (breakpointValue === "grow") {
          classes.push(`${breakpoint}:flex-1`);
        } else if (typeof breakpointValue === "number") {
          if (isGrow) {
            classes.push(`${breakpoint}:${prefix}-${breakpointValue}`);
          } else {
            const percentage = (breakpointValue / 12) * 100;
            classes.push(`${breakpoint}:${prefix}-[${percentage}%]`);
          }
        }
      }
    });

    return classes.join(" ");
  }

  return "";
};

// Utility function to generate spacing classes
const generateSpacingClasses = (
  spacing: GridSpacing | undefined,
  type: "gap" | "row-gap" | "column-gap"
): string => {
  if (spacing === undefined) return "";

  if (typeof spacing === "number") {
    const spacingMap: Record<number, string> = {
      0: "gap-0",
      0.5: "gap-0.5",
      1: "gap-1",
      1.5: "gap-1.5",
      2: "gap-2",
      2.5: "gap-2.5",
      3: "gap-3",
      3.5: "gap-3.5",
      4: "gap-4",
      5: "gap-5",
      6: "gap-6",
      7: "gap-7",
      8: "gap-8",
      9: "gap-9",
      10: "gap-10",
      11: "gap-11",
      12: "gap-12",
    };

    const baseClass = spacingMap[spacing] || `gap-[${spacing * 0.25}rem]`;

    if (type === "gap") return baseClass;
    if (type === "row-gap") return baseClass.replace("gap-", "gap-y-");
    if (type === "column-gap") return baseClass.replace("gap-", "gap-x-");

    return baseClass;
  }

  if (typeof spacing === "object") {
    const classes: string[] = [];
    const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

    breakpoints.forEach(breakpoint => {
      const breakpointValue = spacing[breakpoint];
      if (breakpointValue !== undefined) {
        const spacingMap: Record<number, string> = {
          0: "gap-0",
          0.5: "gap-0.5",
          1: "gap-1",
          1.5: "gap-1.5",
          2: "gap-2",
          2.5: "gap-2.5",
          3: "gap-3",
          3.5: "gap-3.5",
          4: "gap-4",
          5: "gap-5",
          6: "gap-6",
          7: "gap-7",
          8: "gap-8",
          9: "gap-9",
          10: "gap-10",
          11: "gap-11",
          12: "gap-12",
        };

        const baseClass =
          spacingMap[breakpointValue] || `gap-[${breakpointValue * 0.25}rem]`;
        let responsiveClass = baseClass;

        if (type === "row-gap")
          responsiveClass = baseClass.replace("gap-", "gap-y-");
        if (type === "column-gap")
          responsiveClass = baseClass.replace("gap-", "gap-x-");

        classes.push(`${breakpoint}:${responsiveClass}`);
      }
    });

    return classes.join(" ");
  }

  return "";
};

// Utility function to generate offset classes
const generateOffsetClasses = (offset: GridOffset | undefined): string => {
  if (offset === undefined) return "";

  if (typeof offset === "number") {
    const percentage = (offset / 12) * 100;
    return `ml-[${percentage}%]`;
  }

  if (offset === "auto") {
    return "ml-auto";
  }

  if (typeof offset === "object") {
    const classes: string[] = [];
    const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl"];

    breakpoints.forEach(breakpoint => {
      const breakpointValue = offset[breakpoint];
      if (breakpointValue !== undefined) {
        if (breakpointValue === "auto") {
          classes.push(`${breakpoint}:ml-auto`);
        } else if (typeof breakpointValue === "number") {
          const percentage = (breakpointValue / 12) * 100;
          classes.push(`${breakpoint}:ml-[${percentage}%]`);
        }
      }
    });

    return classes.join(" ");
  }

  return "";
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, children, ...props }, ref) => {
    // Check if this is a container
    if ("container" in props && props.container) {
      const {
        container,
        spacing,
        rowSpacing,
        columnSpacing,
        direction = "row",
        columns = 12,
        wrap = "wrap",
        justifyContent,
        alignItems,
        alignContent,
        ...rest
      } = props as GridContainerProps;

      const containerClasses = [
        "flex",
        direction === "row"
          ? "flex-row"
          : direction === "column"
            ? "flex-col"
            : direction === "row-reverse"
              ? "flex-row-reverse"
              : "flex-col-reverse",
        wrap === "nowrap"
          ? "flex-nowrap"
          : wrap === "wrap"
            ? "flex-wrap"
            : "flex-wrap-reverse",
        justifyContent &&
          `justify-${justifyContent.replace("space-", "space-")}`,
        alignItems && `items-${alignItems}`,
        alignContent && `content-${alignContent.replace("space-", "space-")}`,
        generateSpacingClasses(spacing, "gap"),
        generateSpacingClasses(rowSpacing, "row-gap"),
        generateSpacingClasses(columnSpacing, "column-gap"),
        className,
      ].filter(Boolean);

      return (
        <div
          ref={ref}
          className={cn(containerClasses)}
          // style={
          //   {
          //     "--grid-columns": columns,
          //   } as React.CSSProperties
          // }
          {...rest}
        >
          {children}
        </div>
      );
    }

    // This is a grid item
    const {
      size,
      offset,
      display,
      justifyContent,
      alignItems,
      alignSelf,
      ...rest
    } = props as GridItemProps;

    const itemClasses = [
      // Size classes
      size ? generateResponsiveClasses(size, "w", false) : "flex-1",
      // Offset classes
      generateOffsetClasses(offset),
      // Display classes
      display && `flex`,
      display === "inline-flex" && "inline-flex",
      display === "block" && "block",
      display === "inline-block" && "inline-block",
      display === "none" && "hidden",
      // Flex alignment classes
      justifyContent && `justify-${justifyContent.replace("space-", "space-")}`,
      alignItems && `items-${alignItems}`,
      alignSelf && `self-${alignSelf}`,
      // Ensure proper flex behavior
      !size && "flex-1",
      "min-w-0", // Prevent overflow
      className,
    ].filter(Boolean);

    return (
      <div ref={ref} className={cn(itemClasses)} {...rest}>
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

// Export utility types and functions
export {
  generateOffsetClasses,
  generateResponsiveClasses,
  generateSpacingClasses,
};
