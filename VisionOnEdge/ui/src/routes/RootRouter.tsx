import React, { FC } from 'react';
import { Switch } from 'react-router-dom';
import Home from '../pages/Home';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { Parts } from '../pages/Parts';
import LabelingPage from '../pages/LabelingPage';
import Locations from '../pages/Locations';
import LocationRegister from '../pages/LocationRegister';
import CrumbRoute from '../components/CrumbRoute';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <CrumbRoute title="Home/Location/Register" path="/location/register" component={LocationRegister} />
      <CrumbRoute title="Home/Location" path="/location" component={Locations} />
      <CrumbRoute title="Home/Label" path="/label/:imageIndex" component={LabelingPage} />
      <CrumbRoute title="Home/Camera/Details" path="/cameras/:name" component={CameraDetails} />
      <CrumbRoute title="Home/Camera" path="/cameras" component={Cameras} />
      <CrumbRoute title="Home/Part" path="/parts" component={Parts} />
      <CrumbRoute title="Home" path="/" component={Home} />
    </Switch>
  );
};
