import { useEffect, useRef, useState } from "react";

// Starts fast and settles into the target value
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Animates a number from its previous value to `target` whenever `target` changes
export default function useCountUp(target, duration = 2000) {
  const numericTarget = Number(target) || 0;
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = valueRef.current;
    const to = numericTarget;

    if (from === to) return;

    cancelAnimationFrame(frameRef.current);
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = from + (to - from) * easeOutExpo(progress);

      valueRef.current = current;
      setValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [numericTarget, duration]);

  return value;
}
