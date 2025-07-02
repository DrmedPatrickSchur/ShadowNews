import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    syncData?: boolean;
  }
): [T, SetValue<T>, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true
  } = options || {};

  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: SetValue<T> = useCallback((value) => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key "${key}" even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to local storage
      window.localStorage.setItem(key, serializer(newValue));

      // Save state
      setStoredValue(newValue);

      // We dispatch a custom event so every useLocalStorage hook are notified
      if (syncData) {
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue, syncData]);

  // Remove value from local storage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried removing localStorage key "${key}" even though environment is not a client`
      );
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      // We dispatch a custom event so every useLocalStorage hook are notified
      if (syncData) {
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncData]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    // Define the listening function
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key !== key) {
        return;
      }
      setStoredValue(readValue());
    };

    const handleLocalStorageChange = () => {
      setStoredValue(readValue());
    };

    // Listen to storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Listen to custom event from same tab/window if syncData is enabled
    if (syncData) {
      window.addEventListener('local-storage', handleLocalStorageChange);
    }

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncData) {
        window.removeEventListener('local-storage', handleLocalStorageChange);
      }
    };
  }, [key, readValue, syncData]);

  return [storedValue, setValue, removeValue];
}

// Typed versions for common use cases
export function useLocalStorageString(
  key: string,
  initialValue: string,
  syncData = true
): [string, SetValue<string>, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (v) => v,
    deserializer: (v) => v,
    syncData
  });
}

export function useLocalStorageNumber(
  key: string,
  initialValue: number,
  syncData = true
): [number, SetValue<number>, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (v) => v.toString(),
    deserializer: (v) => Number(v),
    syncData
  });
}

export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean,
  syncData = true
): [boolean, SetValue<boolean>, () => void] {
  return useLocalStorage(key, initialValue, {
    serializer: (v) => v.toString(),
    deserializer: (v) => v === 'true',
    syncData
  });
}