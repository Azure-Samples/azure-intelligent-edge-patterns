import React, { FC, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Grid } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import CameraDetailInfo from '../components/CameraDetails/CameraDetailInfo';
import { CameraConfigureInfo, CreateCameraConfig } from '../components/CameraConfigure';
import { getCameras } from '../store/camera/cameraActions';
import { Camera } from '../store/camera/cameraTypes';
import { Project } from '../store/project/projectTypes';
import { State } from '../store/State';
import { thunkGetProject } from '../store/project/projectActions';
import { useQuery } from '../hooks/useQuery';

const CameraDetails: FC = (): JSX.Element => {
  const dispatch = useDispatch();
  const name = useQuery().get('name');
  const { project, camera } = useSelector<State, { project: Project; camera: Camera }>((state) => ({
    project: state.project,
    camera: state.cameras.find((ele) => ele.name === name),
  }));

  useEffect(() => {
    dispatch(thunkGetProject());
    dispatch(getCameras());
  }, [dispatch]);

  if (!camera) return <Redirect to="/cameras" />;

  const hasProject = project.data.camera === camera.id;

  return (
    <Grid columns="2" design={{ height: '100%' }}>
      <CameraDetailInfo id={camera.id} name={name} rtsp={camera.rtsp} modelName={camera.model_name} />
      {hasProject ? (
        <CameraConfigureInfo camera={camera} projectId={project.data.id} />
      ) : (
        <CreateCameraConfig />
      )}
    </Grid>
  );
};

export default CameraDetails;
