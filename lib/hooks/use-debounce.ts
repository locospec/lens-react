import { useEffect, useState } from "react";

/**
 * Hook that debounces a value with a specified delay
 *
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that provides a debounced state with immediate local updates
 * Similar pattern to search-box.tsx but more generic
 *
 * @param initialValue The initial value
 * @param delay The debounce delay in milliseconds (default: 300)
 * @returns [localValue, setLocalValue, debouncedValue]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [localValue, setLocalValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(localValue, delay);

  return [localValue, setLocalValue, debouncedValue];
}
