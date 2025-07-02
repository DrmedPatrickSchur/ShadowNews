import { useState, useEffect } from 'react';

/**
 * Hook that delays updating a value until after a specified delay has passed
 * since the last time it was changed.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced callback function.
 * The callback will only be invoked after the specified delay has passed
 * since the last call.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const debouncedCallback = (...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  };

  return debouncedCallback;
}

/**
 * Hook that provides a value, a setter function, and a debounced value.
 * Useful for inputs where you want immediate UI updates but debounced API calls.
 *
 * @param initialValue - The initial value
 * @param delay - The delay in milliseconds
 * @returns An object containing value, setValue, and debouncedValue
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  debouncedValue: T;
} {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return {
    value,
    setValue,
    debouncedValue,
  };
}

/**
 * Hook that tracks whether a value is currently being debounced.
 * Returns true during the debounce delay period.
 *
 * @param value - The value being tracked
 * @param delay - The delay in milliseconds
 * @returns Whether the value is currently being debounced
 */
export function useDebouncing<T>(value: T, delay: number): boolean {
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (delay === 0) return;

    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return isDebouncing;
}

export default useDebounce;