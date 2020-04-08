import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { Parts } from '../pages/Parts';
import LabelingPage from '../pages/LabelingPage';

export const RootRouter: React.FC = () => {
  return (
    <Switch>
      <Route path="/label" component={LabelingPage} />
      <Route path="/cameras/:name" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts" component={Parts} />
      <Route path="/" component={null} />
    </Switch>
  );
};
