interface ViewHeaderProps {
  title: string;
  loadedCount: number;
  totalCount?: number | null;
}

export function ViewHeader({ loadedCount }: ViewHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b py-2">
      <h3 className="text-sm font-medium"></h3>
      <div className="text-muted-foreground text-sm">
        {loadedCount} records loaded
      </div>
    </div>
  );
}
