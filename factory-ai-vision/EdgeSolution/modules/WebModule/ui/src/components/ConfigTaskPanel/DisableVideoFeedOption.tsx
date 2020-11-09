import { Toggle } from '@fluentui/react';
import React from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type DisableVideoOption = Pick<ProjectData, 'disableVideoFeed'> & { onChange: OnChangeType };

export const DisableVideoOption: React.FC<DisableVideoOption> = ({ disableVideoFeed, onChange }) => {
  return (
    <OptionLayout title="Disable live video" subTitle="Disable the live video for performance testing">
      <Toggle
        inlineLabel
        label={`${disableVideoFeed ? 'Disable' : 'Show'} live video`}
        checked={disableVideoFeed}
        onChange={(_, checked) => {
          onChange('disableVideoFeed', checked);
        }}
      />
    </OptionLayout>
  );
};
