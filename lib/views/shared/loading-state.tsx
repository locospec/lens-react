interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-muted-foreground text-sm">{message}</div>
    </div>
  );
}
