import { cn } from "@lens2/shadcn/lib/utils";
import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import * as React from "react";

// Container Sheet that mounts within a specific container
export const ContainerSheet = SheetPrimitive.Root;

export const ContainerSheetTrigger = SheetPrimitive.Trigger;

export const ContainerSheetClose = SheetPrimitive.Close;

// Custom portal that accepts a container ref
export const ContainerSheetPortal = ({
  children,
  containerRef,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal> & {
  containerRef?: React.RefObject<HTMLElement | null>;
}) => (
  <SheetPrimitive.Portal container={containerRef?.current} {...props}>
    {children}
  </SheetPrimitive.Portal>
);

// Custom content that renders within the container
export function ContainerSheetContent({
  className,
  children,
  containerRef,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <ContainerSheetPortal containerRef={containerRef}>
      <SheetPrimitive.Overlay
        className={cn(
          "absolute inset-0 z-50 bg-black/50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      <SheetPrimitive.Content
        className={cn(
          "bg-background absolute inset-y-0 right-0 z-50 h-full w-80 border-l shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          className
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">
          Sheet Content
        </SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">
          Configuration panel
        </SheetPrimitive.Description>
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </ContainerSheetPortal>
  );
}
