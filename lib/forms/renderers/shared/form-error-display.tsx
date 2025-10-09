interface FormErrorDisplayProps {
  errors: any[];
  className?: string;
}

/**
 * Shared component for displaying form errors
 * Can be styled differently for Material vs Shadcn
 */
export function FormErrorDisplay({
  errors,
  className = "",
}: FormErrorDisplayProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={`text-sm text-red-500 ${className}`}>
      {errors.map((error, index) => (
        <div key={index} className="mb-1">
          {error.message || error}
        </div>
      ))}
    </div>
  );
}
