import { RefObject, useEffect, useRef, useState } from "react";

export type PullToRefreshStatus = "idle" | "pulling" | "ready" | "refreshing";

type UsePullToRefreshOptions = {
  enabled?: boolean;
  isRefreshing?: boolean;
  threshold?: number;
  maxPullDistance?: number;
  onRefresh: () => Promise<unknown> | unknown;
};

export function usePullToRefresh<TElement extends HTMLElement>({
  enabled = true,
  isRefreshing = false,
  threshold = 72,
  maxPullDistance = 112,
  onRefresh
}: UsePullToRefreshOptions) {
  const containerRef = useRef<TElement>(null);
  const startYRef = useRef<number | null>(null);
  const pullDistanceRef = useRef(0);
  const isTrackingRef = useRef(false);
  const refreshRef = useRef(onRefresh);
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<PullToRefreshStatus>("idle");

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) {
      resetPullState();
      return;
    }

    const element = containerRef.current ?? document.documentElement;

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshing || window.scrollY > 0 || element.scrollTop > 0) return;

      startYRef.current = event.touches[0]?.clientY ?? null;
      isTrackingRef.current = startYRef.current !== null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTrackingRef.current || startYRef.current === null || isRefreshing) return;

      const currentY = event.touches[0]?.clientY ?? startYRef.current;
      const nextDistance = Math.max(0, currentY - startYRef.current);

      if (nextDistance <= 0) return;

      event.preventDefault();

      const dampedDistance = Math.min(maxPullDistance, nextDistance * 0.55);
      pullDistanceRef.current = dampedDistance;
      setPullDistance(dampedDistance);
      setStatus(dampedDistance >= threshold ? "ready" : "pulling");
    };

    const handleTouchEnd = () => {
      if (!isTrackingRef.current) return;

      const shouldRefresh = pullDistanceRef.current >= threshold;
      resetTracking();

      if (!shouldRefresh) {
        resetPullState();
        return;
      }

      setStatus("refreshing");
      setPullDistance(threshold);

      void Promise.resolve(refreshRef.current()).finally(() => {
        resetPullState();
      });
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [enabled, isRefreshing, maxPullDistance, threshold]);

  const progress = Math.min(1, pullDistance / threshold);

  return {
    containerRef: containerRef as RefObject<TElement>,
    isActive: status !== "idle",
    progress,
    pullDistance,
    status
  };

  function resetTracking() {
    startYRef.current = null;
    pullDistanceRef.current = 0;
    isTrackingRef.current = false;
  }

  function resetPullState() {
    resetTracking();
    setPullDistance(0);
    setStatus("idle");
  }
}
