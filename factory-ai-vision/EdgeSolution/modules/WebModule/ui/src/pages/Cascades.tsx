import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getTrainingProject } from '../store/trainingProjectSlice';

import CascadesComponent from '../components/Cascades/Create/Create';
import CascadesContainer from '../components/Cascades/CascadesContainer';

const Cascades = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTrainingProject(true));
  }, [dispatch]);

  return <CascadesContainer />;
};

export default Cascades;
