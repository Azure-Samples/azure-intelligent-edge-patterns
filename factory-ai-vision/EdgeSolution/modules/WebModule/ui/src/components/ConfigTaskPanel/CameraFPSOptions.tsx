import { Toggle, MaskedTextField } from '@fluentui/react';
import React from 'react';
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
      <MaskedTextField
        value={(setFpsManually ? fps : recomendedFps)?.toString()}
        onChange={(_, val) => onChange('fps', parseInt(val, 10))}
        disabled={!setFpsManually}
        errorMessage={
          fps > recomendedFps && setFpsManually
            ? `The recommended value for FPS is '${recomendedFps}', higher than the recommended value will affect the performance.`
            : ''
        }
        styles={{ errorMessage: { maxWidth: '200px' } }}
        mask="999 fps"
        maskChar=" "
      />
    </OptionLayout>
  );
};
