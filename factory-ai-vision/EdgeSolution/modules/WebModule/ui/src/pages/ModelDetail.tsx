import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { selectTrainingProjectById, getSingleTrainingProject } from '../store/trainingProjectSlice';

import CVModelDetail from '../components/CVModelDetail/ModelDetail';

export const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const trainingProject = useSelector((state: RootState) => selectTrainingProjectById(state, id));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await Promise.all([dispatch(getSingleTrainingProject(parseInt(id, 10)))]);
      setIsLoading(false);
    })();
  }, [dispatch, id]);

  if (isLoading) return <h1>Loading...</h1>;

  return <CVModelDetail cvModel={trainingProject} />;
};
