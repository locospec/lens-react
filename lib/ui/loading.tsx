import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
    </div>
  );
}
