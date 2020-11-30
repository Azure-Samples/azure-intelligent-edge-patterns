import React, { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { State } from 'RootStateType';

import { Status } from '../store/project/projectTypes';

import { Home } from '../pages/Home';
import { Cameras } from '../pages/Cameras';
import { CameraDetails } from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import { Parts } from '../pages/Parts';
import { Images } from '../pages/Images';
import { DeploymentPage } from '../pages/Deployment';
import { Models } from '../pages/Models';
import { ModelDetail } from '../pages/ModelDetail';

export const RootRouter: FC = () => {
  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);

  return (
    <Switch>
      <Route path="/deployment" component={DeploymentPage} />
      <Route path="/models/detail" component={ModelDetail} />
      <Route path="/models" component={Models} />
      <Route path="/cameras/detail" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts/detail" component={PartDetails} />
      <Route path="/parts" component={Parts} />
      <Route path="/images" component={Images} />
      <Route path="/home" component={Home} />
      <Route path="/">
        <Redirect to={projectHasConfiged ? '/deployment' : '/home'} />
      </Route>
    </Switch>
  );
};
