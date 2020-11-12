import { Checkbox, Dropdown, IDropdownOption, TextField, Toggle } from '@fluentui/react';
import React from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type SendVideoOptionsProps = Pick<
  ProjectData,
  | 'SVTCisOpen'
  | 'SVTCcameras'
  | 'SVTCparts'
  | 'SVTCconfirmationThreshold'
  | 'SVTCRecordingDuration'
  | 'SVTCEnableTracking'
> & {
  onChange: OnChangeType;
  selectedCameraOptions: IDropdownOption[];
  selectedPartOptions: IDropdownOption[];
};

export const SendVideoOptions: React.FC<SendVideoOptionsProps> = ({
  SVTCisOpen,
  SVTCcameras,
  SVTCparts,
  SVTCconfirmationThreshold,
  SVTCRecordingDuration,
  SVTCEnableTracking,
  onChange,
  selectedCameraOptions,
  selectedPartOptions,
}) => {
  return (
    <OptionLayout title="Send video to cloud" subTitle="Define criteria to trigger event to store in cloud">
      <Toggle
        inlineLabel
        label="Enable sending video"
        checked={SVTCisOpen}
        onChange={(_, checked) => {
          onChange('SVTCisOpen', checked);
        }}
      />
      <Dropdown
        label="Cameras"
        disabled={!SVTCisOpen}
        options={selectedCameraOptions}
        multiSelect
        selectedKeys={SVTCcameras}
        onChange={(_, option) => {
          onChange(
            'SVTCcameras',
            option.selected
              ? [...SVTCcameras, option.key as number]
              : SVTCcameras.filter((key) => key !== option.key),
          );
        }}
      />
      <Dropdown
        label="Objects"
        disabled={!SVTCisOpen}
        options={selectedPartOptions}
        multiSelect
        selectedKeys={SVTCparts}
        onChange={(_, option) => {
          onChange(
            'SVTCparts',
            option.selected
              ? [...SVTCparts, option.key as number]
              : SVTCparts.filter((key) => key !== option.key),
          );
        }}
      />
      <TextField
        label="Confirmation threshold"
        type="number"
        disabled={!SVTCisOpen}
        value={SVTCconfirmationThreshold.toString()}
        onChange={(_, newValue) => {
          onChange('SVTCconfirmationThreshold', parseInt(newValue, 10));
        }}
      />
      <Dropdown
        label="Recording duration (min)"
        options={Array(5)
          .fill(1)
          .map((_, idx) => idx + 1)
          .map((e) => ({ key: e, text: e.toString() }))}
        selectedKey={SVTCRecordingDuration}
        disabled={!SVTCisOpen}
        onChange={(_, option) => onChange('SVTCRecordingDuration', option.key as number)}
      />
      <Checkbox
        label="Enable tracking"
        checked={SVTCEnableTracking}
        onChange={(_, checked) => {
          onChange('SVTCEnableTracking', checked);
        }}
        disabled={!SVTCisOpen}
      />
    </OptionLayout>
  );
};
