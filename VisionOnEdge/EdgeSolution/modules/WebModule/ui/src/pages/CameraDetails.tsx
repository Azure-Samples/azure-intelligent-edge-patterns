import React, { FC, useEffect } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { Grid } from '@fluentui/react-northstar';
import { useSelector, useDispatch } from 'react-redux';

import CameraDetailInfo from '../components/CameraDetails/CameraDetailInfo';
import { CameraConfigureInfo, CreateCameraConfig } from '../components/CameraConfigure';
import { useCameras } from '../hooks/useCameras';
import { Project } from '../store/project/projectTypes';
import { State } from '../store/State';
import { thunkGetProject } from '../store/project/projectActions';

const CameraDetails: FC = (): JSX.Element => {
  const { name } = useParams();
  const camera = useCameras().find((ele) => ele.name === name);
  const project = useSelector<State, Project>((state) => state.project);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(thunkGetProject());
  }, []);

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
