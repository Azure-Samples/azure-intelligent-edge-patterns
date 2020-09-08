import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Stack, Pivot, PivotItem, Spinner } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { Customize } from '../components/Customize';
import { selectAllCameras, getCameras } from '../store/cameraSlice';
import { selectAllImages, getImages } from '../store/imageSlice';
import { thunkGetProject } from '../store/project/projectActions';
import { Status } from '../store/project/projectTypes';
import { Deployment } from '../components/Deployment';

export const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const hasCamera = useSelector((state: State) => selectAllCameras(state).length > 0);
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
    history.push(`/${item.props.itemKey}`);
  };

  const onRenderMain = () => {
    if (loading) return <Spinner label="Loading" />;

    const route = location.pathname.split('/')[1];
    if (route === 'getStarted') return <h1>Get started</h1>;
    if (route === 'deployment') return <Deployment isDemo={false} />;
    if (route === 'customize')
      return <Customize hasCamera={hasCamera} hasImages={hasImages} hasTask={projectHasConfiged} />;
  };

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <Pivot selectedKey={location.pathname.split('/')[1]} onLinkClick={onPivotChange}>
        <PivotItem itemKey="getStarted" headerText="Get started" />
        <PivotItem itemKey="customize" headerText="Customize" />
        <PivotItem itemKey="deployment" headerText="Deployment" />
      </Pivot>
      <Stack grow>{onRenderMain()}</Stack>
    </Stack>
  );
};
