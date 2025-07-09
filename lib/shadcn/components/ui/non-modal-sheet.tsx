import { cn } from "@lens2/shadcn/lib/utils";
import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import * as React from "react";

// Non-modal Sheet that doesn't block main page interaction
export function NonModalSheet({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root modal={false} {...props} />;
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
      <SheetPrimitive.Overlay className="pointer-events-none fixed inset-0 z-50" />

      <SheetPrimitive.Content
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          "pointer-events-auto",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
