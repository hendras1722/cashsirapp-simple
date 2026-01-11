"use client";

import { useEffect, useState } from "react";

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export default function AnimatedCounter({
  value,
  duration = 1000,
  className,
  formatter,
}: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed      = currentTime - startTime;
      const progress     = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * value);
      setCount(currentValue);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{formatter ? formatter(count) : count}</span>;
}
