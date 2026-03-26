import { useEffect, useRef, useState } from "react";

interface Props { to: number; duration?: number; suffix?: string; decimals?: number; className?: string; delay?: number }

export function CountUp({ to, duration = 900, suffix = "", decimals = 0, className, delay = 0 }: Props) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const timer = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts;
        const p = Math.min((ts - startRef.current) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(eased * to);
        if (p < 1) raf.current = requestAnimationFrame(animate);
      };
      raf.current = requestAnimationFrame(animate);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [to, duration, delay]);

  return (
    <span className={className}>
      {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}{suffix}
    </span>
  );
}

export default CountUp;
