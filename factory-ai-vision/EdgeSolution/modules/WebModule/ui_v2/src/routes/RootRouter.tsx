import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Cameras } from '../pages/Cameras';
import { CameraDetails } from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import { Parts } from '../pages/Parts';
import { Images } from '../pages/Images';

export const RootRouter: FC = () => {
  return (
    <Switch>
      <Route path="/cameras/detail" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts/detail" component={PartDetails} />
      <Route path="/parts" component={Parts} />
      <Route path="/images" component={Images} />
      <Route path="/" component={Home} />
    </Switch>
  );
};
