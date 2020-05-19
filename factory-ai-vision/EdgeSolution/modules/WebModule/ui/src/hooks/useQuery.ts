import { useLocation } from 'react-router-dom';

/**
 * Get query parameter in the route
 */
export const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search);
};
