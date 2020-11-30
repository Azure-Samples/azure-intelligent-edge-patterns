/* eslint react/display-name: "off" */

import React, { useState, useEffect } from 'react';
import { useLocation, useHistory, Switch, Route, Redirect } from 'react-router-dom';
import { Stack, Pivot, PivotItem, Spinner } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { getCameras } from '../store/cameraSlice';
import { getImages } from '../store/imageSlice';
import { thunkGetProject } from '../store/project/projectActions';
import { Status } from '../store/project/projectTypes';

import { Customize } from '../components/Home/Customize';
import { GetStarted } from '../components/Home/GetStarted';

const BaseHome: React.FC = () => {
  const dispatch = useDispatch();
  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getCameras(false));
      await dispatch(getImages({ freezeRelabelImgs: false }));
      await dispatch(thunkGetProject());
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading) return <Spinner label="Loading" />;

  return (
    <Switch>
      <Route path="/home/customize">
        <Customize />
      </Route>
      <Route path="/home/getStarted">
        <GetStarted hasTask={projectHasConfiged} />
      </Route>
      <Route path="/home">
        <Redirect to={'/home/getStarted'} />
      </Route>
    </Switch>
  );
};

export const Home = R.compose(
  (BaseComponent: React.ComponentType<{}>): React.FC => () => {
    const location = useLocation();
    const history = useHistory();

    const onPivotChange = (item: PivotItem) => {
      history.push(`/home/${item.props.itemKey}`);
    };

    return (
      <>
        <Stack styles={{ root: { height: '100%' } }}>
          <Pivot selectedKey={location.pathname.split('/')[2]} onLinkClick={onPivotChange}>
            <PivotItem itemKey="getStarted" headerText="Get started" />
            <PivotItem itemKey="customize" headerText="Scenario library" />
          </Pivot>
          <Stack grow>
            <BaseComponent />
          </Stack>
        </Stack>
      </>
    );
  },
)(BaseHome);
