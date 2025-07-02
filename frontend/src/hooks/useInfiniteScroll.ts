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