import { useEffect, useState } from 'react';

/**
 * Fetch the parts data from server
 */
export const useParts = (): any[] => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    fetch('/api/parts/')
      .then((res) => res.json())
      .then((data) => {
        setParts(data);
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return parts;
};
