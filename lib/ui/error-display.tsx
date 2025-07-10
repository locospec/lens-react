interface ErrorDisplayProps {
  error: Error;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div>
      <p>Error: {error.message}</p>
    </div>
  );
}
