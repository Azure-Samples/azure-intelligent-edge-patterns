import { Toggle, TextField } from '@fluentui/react';
import React, { useMemo } from 'react';
import * as R from 'ramda';

import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

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
    if (setFpsManually) {
      if (R.isEmpty(fps)) return `Need to enter number.`;
      if (+fps < 0.1) return `FPS cannot be less than 0.1.`;
      if (!Number(fps)) return `Only number format.`;
      if (parseFloat(fps) > recomendedFps)
        return `The recommended value for FPS is '
        ${recomendedFps.toFixed(1).toString()}
      ', higher than the recommended value will affect the performance.`;
    }

    return '';
  }, [setFpsManually, fps, recomendedFps]);

  const localFPS = useMemo(() => {
    const originalFPS = setFpsManually ? fps : recomendedFps;

    if (Number.isInteger(originalFPS)) return (+originalFPS).toFixed(1).toString();

    return originalFPS.toString() || '';
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
        value={localFPS}
        onChange={(_, val) => {
          const newVa = val.replace(/(\d+)(\.\d)(\d*)/, '$1$2');
          onChange('fps', newVa);
        }}
        disabled={!setFpsManually}
        errorMessage={fpsErrorMsg}
        styles={{ errorMessage: { maxWidth: '200px' } }}
        suffix="FPS"
      />
    </OptionLayout>
  );
};
