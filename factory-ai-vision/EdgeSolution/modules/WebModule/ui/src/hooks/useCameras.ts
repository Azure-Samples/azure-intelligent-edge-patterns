import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

import { State } from 'RootStateType';
import { Camera } from '../store/camera/cameraTypes';
import { getCameras } from '../store/camera/cameraActions';

/**
 * Fetch the cameras data from server and set to Redux Store
 */
export const useCameras = (): Camera[] => {
  const dispatch = useDispatch();
  const cameras: Camera[] = useSelector<State, Camera[]>((state) => state.cameras.filter((e) => !e.is_demo));

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  return cameras;
};
