import { useRef, useEffect } from 'react';

export const useInterval = (callback, delay): void => {
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
