import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { X } from "lucide-react"
import { cn } from "@lens2/shadcn/lib/utils"

// Non-modal Sheet that doesn't block main page interaction
export function NonModalSheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root modal={false} {...props} />
}

// Custom content that prevents closing on outside click or escape
export function NonModalSheetContent({
  className,
  children,
  onInteractOutside,
  onEscapeKeyDown,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content>) {
  return (
    <SheetPrimitive.Portal>
      {/* Transparent overlay that doesn't block interactions */}
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 pointer-events-none" />
      
      <SheetPrimitive.Content
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          "pointer-events-auto",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}