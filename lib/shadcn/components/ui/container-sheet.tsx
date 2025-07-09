import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { X } from "lucide-react"
import { cn } from "@lens2/shadcn/lib/utils"

// Container Sheet that mounts within a specific container
export const ContainerSheet = SheetPrimitive.Root

export const ContainerSheetTrigger = SheetPrimitive.Trigger

export const ContainerSheetClose = SheetPrimitive.Close

// Custom portal that accepts a container ref
export const ContainerSheetPortal = ({ 
  children, 
  containerRef,
  ...props 
}: React.ComponentProps<typeof SheetPrimitive.Portal> & {
  containerRef?: React.RefObject<HTMLElement | null>
}) => (
  <SheetPrimitive.Portal container={containerRef?.current} {...props}>
    {children}
  </SheetPrimitive.Portal>
)

// Custom content that renders within the container
export function ContainerSheetContent({
  className,
  children,
  containerRef,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  containerRef?: React.RefObject<HTMLElement | null>
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
          "absolute inset-y-0 right-0 z-50 h-full w-80 border-l bg-background shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          className
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">Sheet Content</SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">Configuration panel</SheetPrimitive.Description>
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </ContainerSheetPortal>
  )
}