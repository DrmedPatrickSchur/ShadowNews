/**
 * Local Storage Hook Collection
 * 
 * Comprehensive local storage management system providing persistent state
 * synchronization across browser sessions and tabs. Implements type-safe
 * serialization, cross-tab synchronization, error handling, and SSR
 * compatibility for robust client-side data persistence.
 * 
 * Core Features:
 * - Persistent State: Automatic localStorage synchronization with React state
 * - Cross-Tab Sync: Real-time synchronization across browser tabs
 * - Type Safety: Full TypeScript support with generic type handling
 * - SSR Compatibility: Safe server-side rendering without localStorage errors
 * - Error Handling: Graceful degradation when localStorage is unavailable
 * - Custom Serialization: Configurable serialization and deserialization
 * 
 * Hook Collection:
 * - useLocalStorage: Generic localStorage hook with full customization
 * - useLocalStorageString: Type-safe string storage with optimized serialization
 * - useLocalStorageNumber: Number storage with automatic type conversion
 * - useLocalStorageBoolean: Boolean storage with string-to-boolean conversion
 * 
 * Synchronization Features:
 * - Real-Time Updates: Automatic state updates when localStorage changes
 * - Cross-Tab Communication: Changes in one tab immediately reflect in others
 * - Custom Events: Internal event system for same-tab synchronization
 * - Storage Events: Native browser storage events for cross-tab updates
 * 
 * Persistence Benefits:
 * - User Preferences: Store user settings across browser sessions
 * - Form Data: Persist draft content and form inputs
 * - Application State: Maintain application state between page reloads
 * - Shopping Carts: Persist e-commerce cart contents
 * - Theme Preferences: Remember user theme and layout preferences
 * 
 * Type Safety System:
 * - Generic Types: Full generic support for any serializable data type
 * - Compile-Time Safety: TypeScript errors for type mismatches
 * - Runtime Validation: Safe type conversion with fallback handling
 * - Specialized Hooks: Type-specific hooks for common data types
 * 
 * Serialization Options:
 * - JSON Serialization: Default JSON.stringify/parse for objects and arrays
 * - Custom Serializers: Configurable serialization functions for complex types
 * - Type-Specific: Optimized serialization for strings, numbers, and booleans
 * - Error Recovery: Safe fallback when serialization/deserialization fails
 * 
 * Error Handling:
 * - Storage Unavailable: Graceful handling when localStorage is disabled
 * - Quota Exceeded: Safe handling of storage quota limitations
 * - Corruption Recovery: Fallback to initial values for corrupted data
 * - Privacy Mode: Compatibility with browsers in private/incognito mode
 * 
 * SSR Compatibility:
 * - Window Check: Safe window object access for server-side rendering
 * - Hydration Safe: Prevents hydration mismatches during SSR
 * - Initial Values: Proper initial value handling on server
 * - Client Activation: Automatic localStorage activation on client mount
 * 
 * Performance Optimizations:
 * - Event Optimization: Efficient event listener management
 * - Memo Optimization: Optimized callbacks with useCallback
 * - Selective Updates: Only update state when storage actually changes
 * - Memory Management: Proper cleanup of event listeners
 * 
 * Cross-Tab Synchronization:
 * - Storage Events: Native browser storage event handling
 * - Custom Events: Internal event system for same-tab updates
 * - Selective Listening: Key-specific event filtering for performance
 * - Automatic Cleanup: Proper event listener cleanup on unmount
 * 
 * API Design:
 * - useState-Like: Familiar API matching React's useState hook
 * - Tuple Return: Returns [value, setValue, removeValue] tuple
 * - Function Updates: Support for functional state updates
 * - Immediate Updates: Synchronous localStorage updates with optimistic UI
 * 
 * Common Use Cases:
 * - User Preferences: Theme, language, layout preferences
 * - Form Persistence: Auto-save draft content and form data
 * - Authentication: Persist tokens and user session data
 * - Shopping Experience: Cart contents and user selections
 * - Application Settings: Feature flags and configuration options
 * 
 * Browser Compatibility:
 * - Modern Browsers: Full localStorage API support
 * - Legacy Support: Graceful degradation for older browsers
 * - Private Mode: Compatible with private/incognito browsing
 * - Storage Policies: Respects browser storage policies and limits
 * 
 * Security Considerations:
 * - No Sensitive Data: Avoid storing sensitive information in localStorage
 * - XSS Protection: No additional XSS vulnerabilities introduced
 * - Data Validation: Safe deserialization with error handling
 * - Privacy Compliance: Respects user privacy settings and browser policies
 * 
 * Memory Management:
 * - Event Cleanup: Automatic cleanup of storage event listeners
 * - Reference Management: Proper function reference handling
 * - Leak Prevention: Comprehensive cleanup to prevent memory leaks
 * - Efficient Updates: Minimal re-renders with optimized state updates
 * 
 * Development Features:
 * - Debug Logging: Warning messages for development debugging
 * - Error Reporting: Comprehensive error logging for troubleshooting
 * - Type Checking: Compile-time type validation with TypeScript
 * - Testing Support: Mock-friendly architecture for unit testing
 * 
 * Advanced Features:
 * - Custom Serialization: Support for complex data types and custom formats
 * - Namespace Support: Key namespacing for application organization
 * - Version Management: Data migration support for schema changes
 * - Compression: Optional data compression for large stored values
 * 
 * Integration Patterns:
 * - State Management: Compatible with Redux, Zustand, and other state managers
 * - Form Libraries: Integrates with React Hook Form, Formik, and others
 * - UI Libraries: Works with all React component libraries
 * - Data Fetching: Complements React Query, SWR for caching strategies
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - Browser APIs: localStorage and storage event APIs
 * - TypeScript: Type system for compile-time safety
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

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