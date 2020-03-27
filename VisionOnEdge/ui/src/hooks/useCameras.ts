import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getCameras } from '../actions/cameras';

import { Camera, State } from '../State';

/**
 * Fetch the cameras data from server and set to Redux Store
 */
export const useCameras = (): Camera[] => {
  const dispatch = useDispatch();
  const cameras: Camera[] = useSelector<State, Camera[]>((state) => state.cameras);

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  return cameras;
};
