import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getIntelProjectList } from '../store/IntelProjectSlice';
import { getParts } from '../store/partSlice';

import ModelContainer from '../components/Models/ModelContainer';

export const Models = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getParts());
    dispatch(getIntelProjectList());
  }, [dispatch]);

  return <ModelContainer />;
};
