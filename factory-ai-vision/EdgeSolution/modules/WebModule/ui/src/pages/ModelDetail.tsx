import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { State } from 'RootStateType';
import { Url } from '../enums';

import {
  selectTrainingProjectById,
  // TrainingProject
} from '../store/trainingProjectSlice';
import { useQuery } from '../hooks/useQuery';

import ModelDetailComponent from '../components/ModelDetail/ModelDetail';
import PartDetail from '../components/ModelParts/PartsDetail';

export const ModelDetail: React.FC = () => {
  const modelId = parseInt(useQuery().get('modelId'), 10);
  const trainingProject = useSelector((state: State) => selectTrainingProjectById(state, modelId));

  // return <ModelDetailComponent project={trainingProject} />;
  return (
    <Switch>
      {/* <Route exact path={routes.dashboard.cameraTaskDetail} component={CameraTaskDetailContainer} />
       */}
      <Route path={Url.MODELS_OBJECTS} component={PartDetail} />
      <Route
        exact
        path={Url.MODELS_DETAIL}
        render={() => <ModelDetailComponent project={trainingProject} />}
      />
    </Switch>
  );
};
