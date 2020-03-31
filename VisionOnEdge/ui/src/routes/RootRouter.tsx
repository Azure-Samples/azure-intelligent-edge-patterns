import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';

export const RootRouter: React.FC = () => {
  return (
    <Switch>
      <Route path="/cameras/:name" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts" component={null} />
      <Route path="/" component={null} />
    </Switch>
  );
};
