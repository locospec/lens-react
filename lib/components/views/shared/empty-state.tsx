interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-muted-foreground text-sm">{message}</div>
    </div>
  );
}
