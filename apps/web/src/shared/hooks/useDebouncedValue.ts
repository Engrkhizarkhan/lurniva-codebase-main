import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` ms. Search boxes feed this into their query key so
 * a keystroke doesn't become a request.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
