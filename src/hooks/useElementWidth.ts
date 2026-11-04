import { useEffect, useState } from "react";

/**
 * Width of an element, kept current with a ResizeObserver.
 * Returns a callback ref plus the width (the fallback until the element mounts).
 * Replaces reading ref.current during render, which React does not re-run on resize.
 */
export function useElementWidth<T extends HTMLElement>(fallback: number) {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, width] as const;
}
