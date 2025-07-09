interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-muted-foreground">{message}</div>
    </div>
  );
}