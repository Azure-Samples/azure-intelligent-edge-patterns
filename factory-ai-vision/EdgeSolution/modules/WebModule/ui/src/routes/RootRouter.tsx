import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import Locations from '../pages/Locations';
import LocationDetails from '../pages/LocationDetails';
import ManualIdentification from '../pages/ManualIdentification';
import { Parts } from '../pages/Parts';
import { PartIdentification } from '../pages/PartIdentification';
import { Setting } from '../pages/Setting';
import { PrivateRoute } from './PrivateRoute';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <PrivateRoute path="/manual" component={ManualIdentification} />
      <PrivateRoute path="/locations/detail" component={LocationDetails} />
      <PrivateRoute path="/locations" component={Locations} />
      <PrivateRoute path="/cameras/detail" component={CameraDetails} />
      <PrivateRoute path="/cameras" component={Cameras} />
      <PrivateRoute path="/parts/detail" component={PartDetails} />
      <PrivateRoute path="/parts" component={Parts} />
      <PrivateRoute path="/partIdentification" component={PartIdentification} />
      <Route path="/setting" component={Setting} />
      <PrivateRoute path="/" component={Home} />
    </Switch>
  );
};
