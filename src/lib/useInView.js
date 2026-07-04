import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled into the viewport.
 * Once visible it stays visible (one-shot reveal), which is what we
 * want for the fade-up animations on the landing page.
 */
export function useInView(options) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options ?? { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView];
}

/**
 * Animates a number counting up from 0 to `target` once `start` is true.
 * Uses requestAnimationFrame for a smooth, dependency-free count.
 */
export function useCountUp(target, start, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);

  return value;
}
