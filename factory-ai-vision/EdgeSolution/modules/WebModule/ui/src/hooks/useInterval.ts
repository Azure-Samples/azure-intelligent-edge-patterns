import { useRef, useEffect } from 'react';

/**
 * A custom hooks that wrap the setInterval function
 * @param callback The callback function of setInterval
 * @param delay The delay time of setInterval. Set to null if you want to stop
 */
export const useInterval = (callback: () => void, delay: number): void => {
  const savedCallback = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick(): void {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return (): void => clearInterval(id);
    }
  }, [delay]);
};
