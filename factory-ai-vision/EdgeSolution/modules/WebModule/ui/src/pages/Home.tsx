import React, { useState, useEffect } from 'react';
import { useLocation, useHistory, Switch, Route, Redirect } from 'react-router-dom';
import { Stack, Pivot, PivotItem, Spinner } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { Customize } from '../components/Customize';
import { getCameras, selectNonDemoCameras } from '../store/cameraSlice';
import { selectAllImages, getImages } from '../store/imageSlice';
import { thunkGetProject } from '../store/project/projectActions';
import { Status } from '../store/project/projectTypes';
import { Deployment } from '../components/Deployment/Deployment';
import { GetStarted } from '../components/GetStarted';

export const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const hasCVProject = useSelector(
    (state: State) => !!state.trainingProject.entities[state.trainingProject.nonDemo[0]].customVisionId,
  );
  const hasCamera = useSelector((state: State) => selectNonDemoCameras(state).length > 0);
  const hasImages = useSelector((state: State) => selectAllImages(state).length > 0);
  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getCameras(false));
      await dispatch(getImages());
      await dispatch(thunkGetProject());
      setLoading(false);
      setLoading(false);
    })();
  }, [dispatch]);

  const onPivotChange = (item: PivotItem) => {
    history.push(`/home/${item.props.itemKey}`);
  };

  const onRenderMain = () => {
    if (loading) return <Spinner label="Loading" />;

    return (
      <Switch>
        <Route path="/home/deployment">
          <Deployment />
        </Route>
        <Route path="/home/customize">
          <Customize
            hasCVProject={hasCVProject}
            hasCamera={hasCamera}
            hasImages={hasImages}
            hasTask={projectHasConfiged}
          />
        </Route>
        <Route path="/home/getStarted">
          <GetStarted />
        </Route>
        <Route>
          <Redirect to={projectHasConfiged ? '/home/deployment' : '/home/getStarted'} />
        </Route>
      </Switch>
    );
  };

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <Pivot selectedKey={location.pathname.split('/')[2]} onLinkClick={onPivotChange}>
        <PivotItem itemKey="getStarted" headerText="Get started" />
        <PivotItem itemKey="customize" headerText="Customize" />
        <PivotItem itemKey="deployment" headerText="Deployment" />
      </Pivot>
      <Stack grow>{onRenderMain()}</Stack>
    </Stack>
  );
};
