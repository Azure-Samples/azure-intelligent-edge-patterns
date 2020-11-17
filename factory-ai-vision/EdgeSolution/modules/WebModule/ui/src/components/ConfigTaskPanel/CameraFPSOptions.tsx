import { Toggle, TextField } from '@fluentui/react';
import React, { useMemo } from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';
import * as R from 'ramda';

type CameraFPSOptionsProps = Pick<ProjectData, 'setFpsManually' | 'fps' | 'recomendedFps'> & {
  onChange: OnChangeType;
};

export const CameraFPSOptions: React.FC<CameraFPSOptionsProps> = ({
  setFpsManually,
  fps,
  recomendedFps,
  onChange,
}) => {
  const fpsErrorMsg = useMemo(() => {
    if (!Number(fps)) return `Only number format.`;

    if (+fps < 0.1) return `FPS cannot be less than 0.1.`;

    if (parseFloat(fps) > recomendedFps && setFpsManually)
      return `The recommended value for FPS is '${recomendedFps}', higher than the recommended value will affect the performance.`;

    return '';
  }, [setFpsManually, fps, recomendedFps]);

  return (
    <OptionLayout
      title="Camera FPS"
      subTitle="Set the frames the camera capture per second to get best performance"
    >
      <Toggle
        inlineLabel
        label="Enable setting FPS manually"
        checked={setFpsManually}
        onChange={(_, checked) => {
          onChange('setFpsManually', checked);
        }}
      />
      <TextField
        value={(setFpsManually ? fps : recomendedFps)?.toString() || ''}
        onChange={(_, val) => {
          onChange('fps', val);
        }}
        disabled={!setFpsManually}
        errorMessage={fpsErrorMsg}
        styles={{ errorMessage: { maxWidth: '200px' } }}
        suffix="FPS"
      />
    </OptionLayout>
  );
};
