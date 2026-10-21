import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedStat component
 * Hiệu ứng nhảy số cập nhật view theo phong cách YouTube:
 * - Nhảy số liên tục với tốc độ cao (rapid live view count flutter)
 * - Giảm tốc mượt mà và trực quan (cubic/quartic ease-out)
 * - Dừng dứt khoát chính xác tại con số mục tiêu kèm hiệu ứng chốt số (settle lock)
 * - Tương thích hoàn toàn prefers-reduced-motion và tabular-nums.
 */
export default function AnimatedStat({ value, duration = 1500, className = '', style = {}, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isSettled, setIsSettled] = useState(false);
  const elemRef = useRef(null);
  const animatedRef = useRef(false);

  const numVal = typeof value === 'number' ? value : parseInt(value, 10) || 0;

  useEffect(() => {
    // If reduced motion is preferred or value is 0, render immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || numVal === 0) {
      setDisplayValue(numVal);
      setIsSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          observer.disconnect();

          const startTime = performance.now();
          let lastTickTime = 0;

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Quartic ease-out deceleration curve: fast rapid start -> visible deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            if (progress < 1) {
              // Ticking interval dynamically slows down to emulate live counter deceleration
              const tickInterval = 25 + Math.pow(progress, 3) * 150;

              if (now - lastTickTime >= tickInterval) {
                lastTickTime = now;
                const baseCount = Math.floor(easeProgress * numVal);

                // Subtle live jitter in early-to-mid phase
                let currentVal = baseCount;
                if (progress < 0.75 && numVal > 15) {
                  const jitterRange = Math.max(1, Math.floor(numVal * 0.03));
                  const jitter = Math.floor((Math.random() - 0.45) * jitterRange);
                  currentVal = Math.max(0, Math.min(numVal - 1, baseCount + jitter));
                }

                setDisplayValue(currentVal);
              }

              requestAnimationFrame(animate);
            } else {
              // Lock onto exact final number
              setDisplayValue(numVal);
              setIsSettled(true);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    if (elemRef.current) {
      observer.observe(elemRef.current);
    }

    return () => observer.disconnect();
  }, [numVal, duration]);

  return (
    <span
      ref={elemRef}
      className={`yt-counter-number ${isSettled ? 'yt-counter-settled' : 'yt-counter-ticking'} ${className}`}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        ...style
      }}
    >
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}
