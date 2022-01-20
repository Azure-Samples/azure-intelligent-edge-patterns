import { Stack, TextField, Toggle } from '@fluentui/react';
import React from 'react';
import { ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type RetrainImgOptionType = Pick<
  ProjectData,
  'needRetraining' | 'accuracyRangeMin' | 'accuracyRangeMax' | 'maxImages'
> & { onChange: OnChangeType };

export const RetrainImgOption: React.FC<RetrainImgOptionType> = ({
  needRetraining,
  accuracyRangeMin,
  accuracyRangeMax,
  maxImages,
  onChange,
}) => {
  return (
    <OptionLayout title="Retraining image" subTitle="Save images to tag and improve training model">
      <Toggle
        inlineLabel
        label="Enable capturing images"
        checked={needRetraining}
        onChange={(_, checked) => {
          onChange('needRetraining', checked);
        }}
      />
      {needRetraining && (
        <>
          <Stack horizontal tokens={{ childrenGap: 24 }}>
            <TextField
              label="Min"
              type="number"
              value={accuracyRangeMin?.toString()}
              onChange={(_, newValue) => {
                onChange('accuracyRangeMin', parseInt(newValue, 10));
              }}
              suffix="%"
              disabled={!needRetraining}
            />
            <TextField
              label="Max"
              type="number"
              value={accuracyRangeMax?.toString()}
              onChange={(_, newValue) => {
                onChange('accuracyRangeMax', parseInt(newValue, 10));
              }}
              suffix="%"
              disabled={!needRetraining}
            />
          </Stack>
          <TextField
            label="Minimum Images to store"
            type="number"
            value={maxImages?.toString()}
            onChange={(_, newValue) => {
              onChange('maxImages', parseInt(newValue, 10));
            }}
            disabled={!needRetraining}
          />
        </>
      )}
    </OptionLayout>
  );
};
