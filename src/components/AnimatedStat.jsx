import React, { useState, useEffect, useRef } from 'react';

/**
 * YouTube-style Rolling Odometer Digit Column
 * Cuộn tròn từng chữ số theo phong cách ticker / odometer của YouTube Studio:
 * - Trụ xoay chữ số 0-9 chuyển động trượt mượt mà (cylinder reel)
 * - Tốc độ quay nhanh ở giai đoạn đầu, giảm tốc từ từ và dừng chính xác ở con số mục tiêu
 * - Độ trễ so le (staggered delay) giữa các hàng số tạo hiệu ứng cơ học tự nhiên
 */
function DigitReel({ digit, index, totalDigits, isTriggered, baseDuration = 1800 }) {
  const targetDigit = parseInt(digit, 10);
  if (isNaN(targetDigit)) {
    return <span style={{ display: 'inline-block' }}>{digit}</span>;
  }

  // Tạo dải số quay lặp lại để tạo cảm giác cuộn tròn nhiều vòng như YouTube views
  // 3 vòng hoàn chỉnh (0-9) + 1 vòng tới targetDigit
  const cycles = 2 + (index % 2); // Các cột xoay từ 2 đến 3 vòng
  const numbers = [];
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i <= 9; i++) {
      numbers.push(i);
    }
  }
  for (let i = 0; i <= targetDigit; i++) {
    numbers.push(i);
  }

  const targetIndex = cycles * 10 + targetDigit;
  const singleHeight = 100 / numbers.length;
  const targetTranslateY = -(targetIndex * singleHeight);

  // Thời gian quay tăng dần từ hàng số cao đến hàng số đơn vị (staggered settle)
  const duration = baseDuration + (index * 160);
  const delay = index * 40;

  return (
    <span
      className="yt-digit-reel-column"
      style={{
        display: 'inline-block',
        height: '1.18em',
        lineHeight: '1.18em',
        overflow: 'hidden',
        verticalAlign: 'top',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: isTriggered ? `translateY(${targetTranslateY}%)` : 'translateY(0%)',
          transition: isTriggered
            ? `transform ${duration}ms cubic-bezier(0.12, 0.85, 0.22, 1) ${delay}ms`
            : 'none',
          willChange: 'transform'
        }}
      >
        {numbers.map((num, i) => (
          <span
            key={i}
            style={{
              height: '1.18em',
              lineHeight: '1.18em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {num}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function AnimatedStat({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
  style = {}
}) {
  const [isTriggered, setIsTriggered] = useState(false);
  const containerRef = useRef(null);

  // Format value to string representation
  let formattedStr = '';
  if (typeof value === 'number') {
    formattedStr = value.toLocaleString('vi-VN');
  } else if (typeof value === 'string') {
    formattedStr = value;
  } else {
    formattedStr = '0';
  }

  useEffect(() => {
    // Nếu thiết bị bật reduced-motion, dừng cuộn và hiển thị số ngay
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const characters = formattedStr.split('');

  return (
    <span
      ref={containerRef}
      className={`yt-odometer-counter ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: '1.18em',
        ...style
      }}
    >
      {prefix && <span style={{ marginRight: '2px' }}>{prefix}</span>}
      {characters.map((char, idx) => {
        const isDigit = /\d/.test(char);
        if (!isDigit) {
          return (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                lineHeight: '1.18em',
                padding: char === '.' || char === ',' ? '0 1px' : '0 2px'
              }}
            >
              {char}
            </span>
          );
        }
        return (
          <DigitReel
            key={idx}
            digit={char}
            index={idx}
            totalDigits={characters.length}
            isTriggered={isTriggered}
            baseDuration={duration}
          />
        );
      })}
      {suffix && <span style={{ marginLeft: '2px' }}>{suffix}</span>}
    </span>
  );
}
