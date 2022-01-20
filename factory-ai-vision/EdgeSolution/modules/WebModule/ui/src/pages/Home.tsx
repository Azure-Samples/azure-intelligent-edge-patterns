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
import { getParts } from '../store/partSlice';

import { Status } from '../store/project/projectTypes';
import { Url } from '../enums';

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
      await dispatch(getParts());
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading) return <Spinner label="Loading" />;

  return (
    <Switch>
      <Route path={Url.HOME_CUSTOMIZE}>
        <Customize />
      </Route>
      <Route path={Url.HOME_GET_STARTED}>
        <GetStarted hasTask={projectHasConfiged} />
      </Route>
      <Route path={Url.HOME}>
        <Redirect to={Url.HOME_GET_STARTED} />
      </Route>
    </Switch>
  );
};

export const Home = R.compose(
  (BaseComponent: React.ComponentType<{}>): React.FC => () => {
    const location = useLocation();
    const history = useHistory();

    const onPivotChange = (item: PivotItem) => {
      history.push(`${Url.HOME}/${item.props.itemKey}`);
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
