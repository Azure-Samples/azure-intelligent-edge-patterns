import { Toggle } from '@fluentui/react';
import React from 'react';
import { InferenceProtocol, ProjectData } from '../../store/project/projectTypes';
import { OptionLayout } from './OptionLayout';
import { OnChangeType } from './type';

type ProtocolOptionsProps = Pick<ProjectData, 'inferenceProtocol'> & { onChange: OnChangeType };

export const ProtocolOptions: React.FC<ProtocolOptionsProps> = ({ inferenceProtocol, onChange }) => {
  return (
    <OptionLayout
      title="Protocol of inference"
      subTitle="Select HTTP or gRPC protocol to best fit your inference model"
    >
      <Toggle
        inlineLabel
        label={inferenceProtocol}
        checked={inferenceProtocol === InferenceProtocol.GRPC}
        onChange={(_, checked) => {
          if (checked) onChange('inferenceProtocol', InferenceProtocol.GRPC);
          else onChange('inferenceProtocol', InferenceProtocol.Http);
        }}
      />
    </OptionLayout>
  );
};
