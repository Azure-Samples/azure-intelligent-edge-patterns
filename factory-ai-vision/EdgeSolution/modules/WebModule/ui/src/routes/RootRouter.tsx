import React, { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { State } from 'RootStateType';

import { Status } from '../store/project/projectTypes';
import { Url } from '../enums';

import { Home } from '../pages/Home';
import { Cameras } from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import { Parts } from '../pages/Parts';
import { Images } from '../pages/Images';
import { DeploymentPage } from '../pages/Deployment';
import { Models } from '../pages/Models';
import { ModelDetail } from '../pages/ModelDetail';
import ImageDetail from '../pages/ImageDetail';
import Cascades from '../pages/Cascades';

export const RootRouter: FC = () => {
  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);

  return (
    <Switch>
      <Route path={Url.DEPLOYMENT} component={DeploymentPage} />
      <Route path={Url.CASCADES} component={Cascades} />
      <Route path={Url.MODELS_DETAIL} component={ModelDetail} />
      <Route path={Url.MODELS} component={Models} />
      <Route path={Url.CAMERAS_DETAIL} component={CameraDetails} />
      <Route path={Url.CAMERAS} component={Cameras} />
      <Route path={Url.PARTS_DETAIL} component={PartDetails} />
      <Route path={Url.PARTS} component={Parts} />
      <Route path={Url.IMAGES_DETAIL} component={ImageDetail} />
      <Route path={Url.IMAGES} component={Images} />
      <Route path={Url.HOME} component={Home} />
      <Route path={Url.ROOT}>
        <Redirect to={projectHasConfiged ? Url.DEPLOYMENT : Url.HOME} />
      </Route>
    </Switch>
  );
};
