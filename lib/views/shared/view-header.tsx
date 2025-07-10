interface ViewHeaderProps {
  title: string;
  loadedCount: number;
  totalCount?: number | null;
}

export function ViewHeader({
  title,
  loadedCount,
  totalCount,
}: ViewHeaderProps) {
  return (
    <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="text-muted-foreground text-sm">
        {loadedCount} records loaded
        {totalCount && ` of ${totalCount}`}
      </div>
    </div>
  );
}
