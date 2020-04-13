import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { Parts } from '../pages/Parts';
import LabelingPage from '../pages/LabelingPage';
import Locations from '../pages/Locations';
import LocationRegister from '../pages/LocationRegister';
import { PartIdentification } from '../pages/PartIdentification';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <Route path="/location/register" component={LocationRegister} />
      <Route path="/location" component={Locations} />
      <Route path="/label/:imageIndex" component={LabelingPage} />
      <Route path="/cameras/:name/:projectId" component={CameraDetails} />
      <Route path="/cameras/:name/" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts" component={Parts} />
      <Route path="/partIdentification" component={PartIdentification} />
      <Route path="/" component={Home} />
    </Switch>
  );
};
