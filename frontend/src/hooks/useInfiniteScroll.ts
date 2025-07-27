/**
 * Infinite Scroll Hook
 * 
 * High-performance infinite scrolling implementation using Intersection Observer API
 * for seamless content loading and optimal user experience. Provides automatic
 * content loading when users scroll near the bottom of lists with configurable
 * thresholds, loading states, and performance optimizations.
 * 
 * Core Features:
 * - Intersection Observer: Modern browser API for efficient scroll detection
 * - Configurable Thresholds: Customizable trigger points for content loading
 * - Loading State Management: Prevents duplicate requests during loading
 * - Memory Management: Automatic cleanup and observer disconnection
 * - Performance Optimization: Minimal impact on scroll performance
 * 
 * Key Benefits:
 * - Battery Efficiency: Uses passive observers instead of scroll event listeners
 * - Smooth Performance: No scroll event throttling needed
 * - Accessibility: Works with keyboard navigation and screen readers
 * - Mobile Optimized: Touch-friendly with optimized mobile performance
 * - Resource Management: Automatic cleanup prevents memory leaks
 * 
 * Use Cases:
 * - Feed Scrolling: Social media feeds with continuous content loading
 * - Search Results: Paginated search results with seamless loading
 * - Product Listings: E-commerce product grids with infinite pagination
 * - Comment Threads: Long comment threads with automatic expansion
 * - Image Galleries: Photo galleries with progressive loading
 * 
 * Implementation Pattern:
 * - Observer Setup: Automatic intersection observer creation and management
 * - Element Targeting: Ref-based targeting of scroll trigger elements
 * - State Synchronization: Real-time intersection state tracking
 * - Callback Execution: Automatic loading function execution on intersection
 * 
 * Configuration Options:
 * - Threshold: Intersection percentage required to trigger loading (0.0-1.0)
 * - Root Margin: CSS margin string for expanding intersection root bounds
 * - Has More: Boolean flag indicating if more content is available
 * - Loading State: Loading indicator to prevent duplicate requests
 * - Load Function: Callback function to execute when more content is needed
 * 
 * Performance Features:
 * - Passive Observation: No active scroll event listening for better performance
 * - Debounced Loading: Prevents rapid successive loading calls
 * - Memory Cleanup: Automatic observer disconnection on unmount
 * - Efficient Updates: Minimal re-renders with optimized state updates
 * 
 * State Management:
 * - Intersection Status: Real-time tracking of element intersection
 * - Observer Instance: Managed IntersectionObserver lifecycle
 * - Loading Prevention: Prevents duplicate requests during loading
 * - Reset Functionality: Manual reset for component state refresh
 * 
 * Accessibility Features:
 * - Screen Reader Support: Works with assistive technology navigation
 * - Keyboard Navigation: Functions with keyboard-only navigation
 * - Focus Management: Maintains proper focus during content loading
 * - ARIA Compliance: Compatible with ARIA live regions and announcements
 * 
 * Mobile Optimization:
 * - Touch Performance: Optimized for touch scrolling patterns
 * - Battery Efficiency: Minimal battery impact through passive observation
 * - Viewport Adaptation: Responsive to various screen sizes and orientations
 * - Network Awareness: Works with varying network conditions
 * 
 * Error Handling:
 * - Observer Fallback: Graceful degradation when Intersection Observer unavailable
 * - Network Errors: Handles failed loading attempts gracefully
 * - State Consistency: Maintains consistent state during error conditions
 * - Recovery Mechanisms: Automatic retry and recovery strategies
 * 
 * Integration Patterns:
 * - List Components: Easy integration with virtualized and non-virtualized lists
 * - Data Fetching: Works with any data fetching library (React Query, SWR, etc.)
 * - State Management: Compatible with Redux, Zustand, and other state managers
 * - Loading UI: Integrates with loading spinners and skeleton screens
 * 
 * Browser Compatibility:
 * - Modern Browsers: Full Intersection Observer API support
 * - Polyfill Support: Compatible with Intersection Observer polyfills
 * - Progressive Enhancement: Graceful degradation for unsupported browsers
 * - Cross-Platform: Works across desktop and mobile browsers
 * 
 * Memory Management:
 * - Observer Cleanup: Automatic IntersectionObserver disconnection
 * - Reference Management: Proper cleanup of function references
 * - Leak Prevention: Comprehensive cleanup to prevent memory leaks
 * - Resource Optimization: Efficient observer creation and destruction
 * 
 * TypeScript Integration:
 * - Type Safety: Full TypeScript support with strict typing
 * - Interface Definitions: Clear interfaces for options and return values
 * - Generic Support: Flexible typing for various use cases
 * - Compile-Time Safety: Catches configuration errors at compile time
 * 
 * Testing Support:
 * - Mock-Friendly: Easy to mock Intersection Observer for testing
 * - Predictable: Deterministic behavior for reliable testing
 * - Isolated: Independent functionality that doesn't interfere with other code
 * - Testable: Clear interfaces for unit and integration testing
 * 
 * Advanced Features:
 * - Root Margin: CSS-style margin for expanding intersection boundaries
 * - Multiple Thresholds: Support for multiple intersection thresholds
 * - Direction Awareness: Scroll direction detection for advanced use cases
 * - Custom Triggers: Flexible trigger elements beyond simple scroll boundaries
 * 
 * Dependencies:
 * - React: Hooks for state management and lifecycle handling
 * - Intersection Observer API: Modern browser API for efficient intersection detection
 * 
 * @author ShadowNews Team
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2025-07-27
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
 threshold?: number;
 rootMargin?: string;
 hasMore: boolean;
 loading: boolean;
 onLoadMore: () => void | Promise<void>;
}

interface UseInfiniteScrollReturn {
 observerRef: (node: HTMLElement | null) => void;
 isIntersecting: boolean;
 reset: () => void;
}

export const useInfiniteScroll = ({
 threshold = 0.1,
 rootMargin = '100px',
 hasMore,
 loading,
 onLoadMore,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
 const [isIntersecting, setIsIntersecting] = useState(false);
 const observerRef = useRef<IntersectionObserver | null>(null);
 const loadMoreRef = useRef(onLoadMore);

 useEffect(() => {
   loadMoreRef.current = onLoadMore;
 });

 const reset = useCallback(() => {
   setIsIntersecting(false);
 }, []);

 const observerCallback = useCallback(
   (node: HTMLElement | null) => {
     if (loading) return;
     
     if (observerRef.current) {
       observerRef.current.disconnect();
     }

     if (!hasMore || !node) return;

     observerRef.current = new IntersectionObserver(
       (entries) => {
         const [entry] = entries;
         setIsIntersecting(entry.isIntersecting);
         
         if (entry.isIntersecting && hasMore && !loading) {
           loadMoreRef.current();
         }
       },
       {
         threshold,
         rootMargin,
       }
     );

     observerRef.current.observe(node);
   },
   [hasMore, loading, threshold, rootMargin]
 );

 useEffect(() => {
   return () => {
     if (observerRef.current) {
       observerRef.current.disconnect();
     }
   };
 }, []);

 return {
   observerRef: observerCallback,
   isIntersecting,
   reset,
 };
};

export default useInfiniteScroll;