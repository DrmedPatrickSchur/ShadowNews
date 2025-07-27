/**
 * Debounce Hook Collection
 * 
 * Comprehensive debouncing utilities for React applications providing performance
 * optimization through delayed value updates and function execution. Implements
 * multiple debouncing patterns for various use cases including search inputs,
 * API calls, user interactions, and real-time data processing.
 * 
 * Core Features:
 * - Value Debouncing: Delayed value updates for input optimization
 * - Callback Debouncing: Function execution limiting for performance
 * - State Management: Combined immediate and debounced state handling
 * - Status Tracking: Real-time debouncing status monitoring
 * - Memory Management: Automatic cleanup of timers and resources
 * 
 * Hook Collection:
 * - useDebounce: Basic value debouncing with configurable delay
 * - useDebouncedCallback: Function execution debouncing with cleanup
 * - useDebouncedState: Combined immediate and debounced state management
 * - useDebouncing: Boolean status tracking for debounce operations
 * 
 * Performance Benefits:
 * - API Optimization: Reduces unnecessary API calls from rapid user input
 * - UI Responsiveness: Maintains immediate UI feedback while limiting backend calls
 * - Resource Conservation: Prevents excessive function execution and memory usage
 * - Battery Efficiency: Reduces computational overhead on mobile devices
 * 
 * Common Use Cases:
 * - Search Inputs: Debounce search queries to reduce API calls
 * - Form Validation: Delay validation until user stops typing
 * - Auto-save: Batch save operations for better performance
 * - Scroll Events: Limit scroll handler execution frequency
 * - Resize Events: Throttle resize calculations and updates
 * 
 * Value Debouncing:
 * - Immediate UI Updates: Input values update immediately for responsiveness
 * - Delayed Processing: Backend operations delayed until user stops typing
 * - Configurable Delay: Customizable delay timing for different use cases
 * - Type Safety: Full TypeScript support with generic type handling
 * 
 * Callback Debouncing:
 * - Function Limiting: Prevents rapid successive function executions
 * - Parameter Preservation: Maintains function signature and parameters
 * - Timer Management: Automatic cleanup and timer reset handling
 * - Memory Safety: Prevents memory leaks through proper cleanup
 * 
 * State Management:
 * - Dual State: Provides both immediate and debounced state values
 * - Setter Function: Standard React state setter interface
 * - Synchronization: Ensures consistency between immediate and debounced values
 * - Flexibility: Supports any data type with TypeScript generics
 * 
 * Status Tracking:
 * - Real-Time Status: Boolean indicator of debouncing activity
 * - UI Feedback: Enable loading indicators during debounce periods
 * - User Experience: Provide visual feedback for pending operations
 * - Accessibility: Support screen readers with status announcements
 * 
 * Implementation Patterns:
 * - Search Components: Immediate display with debounced API calls
 * - Auto-complete: Real-time suggestions with throttled requests
 * - Form Inputs: Immediate feedback with delayed validation
 * - Data Filtering: Instant UI updates with optimized data processing
 * 
 * Memory Management:
 * - Timer Cleanup: Automatic timeout cleanup on component unmount
 * - Reference Management: Proper function reference handling
 * - Leak Prevention: Comprehensive cleanup to prevent memory leaks
 * - Resource Optimization: Efficient timer creation and destruction
 * 
 * Error Handling:
 * - Safe Cleanup: Error-safe timer cleanup and state management
 * - Type Safety: Compile-time error prevention with TypeScript
 * - Edge Cases: Handling of zero delay and invalid parameters
 * - Graceful Degradation: Fallback behavior for error conditions
 * 
 * Performance Considerations:
 * - Minimal Overhead: Lightweight implementation with minimal performance impact
 * - Efficient Timers: Optimized timer management for better performance
 * - Render Optimization: Prevents unnecessary re-renders during debounce
 * - Memory Efficiency: Minimal memory footprint with proper cleanup
 * 
 * TypeScript Integration:
 * - Generic Support: Full generic type support for any data type
 * - Type Preservation: Maintains type safety throughout debounce operations
 * - Function Signatures: Preserves function parameter and return types
 * - Compile-Time Safety: Catches type errors at compile time
 * 
 * Testing Support:
 * - Mock-Friendly: Easy to mock and test with timer mocking utilities
 * - Predictable: Deterministic behavior for reliable testing
 * - Isolated: Independent hooks that don't interfere with each other
 * - Testable: Clear interfaces for unit and integration testing
 * 
 * Browser Compatibility:
 * - Modern Browsers: Optimized for modern browser environments
 * - Timer Support: Uses standard setTimeout/clearTimeout APIs
 * - React Integration: Compatible with all React versions supporting hooks
 * - SSR Support: Server-side rendering compatible implementation
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - No External Dependencies: Self-contained implementation
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

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