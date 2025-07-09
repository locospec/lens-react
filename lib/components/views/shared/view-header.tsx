interface ViewHeaderProps {
  title: string;
  loadedCount: number;
  totalCount?: number | null;
}

export function ViewHeader({ title, loadedCount, totalCount }: ViewHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-2 flex-shrink-0">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="text-sm text-muted-foreground">
        {loadedCount} records loaded
        {totalCount && ` of ${totalCount}`}
      </div>
    </div>
  );
}