import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

import { State } from '../store/State';
import { Project } from '../store/project/projectTypes';
import { thunkGetProject } from '../store/project/projectActions';

/**
 * Fetch the project data from server and set to Redux Store
 */
export const useProject = (isDemo?: boolean): Project => {
  const dispatch = useDispatch();
  const project = useSelector<State, Project>((state) => state.project);

  useEffect(() => {
    dispatch(thunkGetProject(isDemo));
  }, [dispatch, isDemo]);

  return project;
};
