import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Grid } from '@fluentui/react-northstar';
import CameraDetailInfo from '../components/CameraDetails/CameraDetailInfo'

import { State, Camera } from '../State';

const CameraDetails: FC = (): JSX.Element => {
  const { name } = useParams();
  const camera = useSelector<State, Camera>((state) => state.cameras.find((e) => e.name === name));

  return (
    <Grid columns="2">
      <CameraDetailInfo name={name} rtsp={camera.rtsp} modelName={camera.model_name} />
    </Grid>
  );
};



export default CameraDetails;
