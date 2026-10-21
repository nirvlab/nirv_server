import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedStat component
 * Displays a number that counts up smoothly when first entering the viewport.
 * Derives strictly from underlying genuine data.
 * Respects prefers-reduced-motion. Runs once.
 */
export default function AnimatedStat({ value, duration = 1200, className = '', style = {}, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elemRef = useRef(null);
  const animatedRef = useRef(false);

  const numVal = typeof value === 'number' ? value : parseInt(value, 10) || 0;

  useEffect(() => {
    // If reduced motion is preferred or value is 0, render immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || numVal === 0) {
      setDisplayValue(numVal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          observer.disconnect();

          const startTime = performance.now();
          const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Quadratic ease-out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeProgress * numVal);
            setDisplayValue(currentCount);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(numVal);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (elemRef.current) {
      observer.observe(elemRef.current);
    }

    return () => observer.disconnect();
  }, [numVal, duration]);

  return (
    <span ref={elemRef} className={className} style={style}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}
