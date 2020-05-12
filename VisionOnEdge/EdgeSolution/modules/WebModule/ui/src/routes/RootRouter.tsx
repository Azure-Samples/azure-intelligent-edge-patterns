import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import LabelingPage from '../pages/LabelingPage';
import Locations from '../pages/Locations';
import LocationRegister from '../pages/LocationRegister';
import LocationDetails from '../pages/LocationDetails';
import ManualIdentification from '../pages/ManualIdentification';
import { Parts } from '../pages/Parts';
import { PartIdentification } from '../pages/PartIdentification';
import { Setting } from '../pages/Setting';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <Route path="/manual" component={ManualIdentification} />
      <Route path="/locations/register" component={LocationRegister} />
      <Route path="/locations/detail" component={LocationDetails} />
      <Route path="/locations" component={Locations} />
      <Route path="/label/:imageIndex" component={LabelingPage} />
      <Route path="/cameras/detail" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts/detail/:partId" component={PartDetails} />
      <Route path="/parts/detail/" component={PartDetails} />
      <Route path="/parts" component={Parts} />
      <Route path="/partIdentification" component={PartIdentification} />
      <Route path="/setting" component={Setting} />
      <Route path="/" component={Home} />
    </Switch>
  );
};
