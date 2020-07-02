import { useEffect, useState } from 'react';

/**
 * Fetch the parts data from server
 */
export const useParts = (isDemo?: boolean): any[] => {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const url = isDemo === undefined ? '/api/parts/' : `/api/parts/?is_demo=${Number(isDemo)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setParts(data);
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, [isDemo]);

  return parts;
};
