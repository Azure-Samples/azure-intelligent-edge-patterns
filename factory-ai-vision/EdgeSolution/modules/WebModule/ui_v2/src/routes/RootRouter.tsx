import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Cameras } from '../pages/Cameras';
import { CameraDetails } from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import { Parts } from '../pages/Parts';
import { Setting } from '../pages/Setting';
import { PrivateRoute } from './PrivateRoute';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <PrivateRoute path="/cameras/detail" component={CameraDetails} />
      <PrivateRoute path="/cameras" component={Cameras} />
      <PrivateRoute path="/parts/detail" component={PartDetails} />
      <PrivateRoute path="/parts" component={Parts} />
      <Route path="/setting" component={Setting} />
      <PrivateRoute path="/" component={Home} />
    </Switch>
  );
};
