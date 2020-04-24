import React, { FC } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { Grid } from '@fluentui/react-northstar';
import CameraDetailInfo from '../components/CameraDetails/CameraDetailInfo';

import { CameraConfigureInfo, CreateCameraConfig } from '../components/CameraConfigure';
import { useCameras } from '../hooks/useCameras';

const CameraDetails: FC = (): JSX.Element => {
  const { name, projectId } = useParams();
  const camera = useCameras().find((ele) => ele.name === name);

  if (!camera) return <span>loading...</span>;

  const hasProject = !!projectId;

  if (camera === undefined) return <Redirect to="/cameras" />;

  return (
    <Grid columns="2" design={{ height: '100%' }}>
      <CameraDetailInfo id={camera.id} name={name} rtsp={camera.rtsp} modelName={camera.model_name} />
      {hasProject ? <CameraConfigureInfo /> : <CreateCameraConfig />}
    </Grid>
  );
};

export default CameraDetails;
