import { IDropdownOption, Stack } from '@fluentui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { State } from 'RootStateType';
import { InferenceSource, ProjectData } from '../../store/project/projectTypes';
import { ExpandPanel } from '../ExpandPanel';
import { CameraFPSOptions } from './CameraFPSOptions';
import { CloudMsgOption } from './CloudMsgOption';
import { DisableVideoOption } from './DisableVideoFeedOption';
import { ProtocolOptions } from './ProtocolOptions';
import { RetrainImgOption } from './RetrainImgOption';
import { SendVideoOptions } from './SendVideoOptions';
import { OnChangeType } from './type';

type AdvancedOptionsProps = {
  projectData: ProjectData;
  selectedCameraOptions: IDropdownOption[];
  selectedPartOptions: IDropdownOption[];
  onChange: OnChangeType;
};

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  projectData,
  selectedCameraOptions,
  selectedPartOptions,
  onChange,
}) => {
  const selectedTrainProjectIsNotDemo = useSelector((state: State) =>
    state.trainingProject.nonDemo.includes(projectData.trainingProject),
  );
  const inferenceSource = useSelector((state: State) => state.project.data.inferenceSource);

  return (
    <ExpandPanel titleHidden="Advanced options" titleVisible="Fewer options" iconPosition="end" bottomBorder>
      <Stack horizontal tokens={{ childrenGap: 50 }} wrap styles={{ root: { paddingTop: '30px' } }}>
        <CloudMsgOption
          sendMessageToCloud={projectData.sendMessageToCloud}
          framesPerMin={projectData.framesPerMin}
          probThreshold={projectData.probThreshold}
          onChange={onChange}
        />
        {selectedTrainProjectIsNotDemo && (
          <RetrainImgOption
            needRetraining={projectData.needRetraining}
            accuracyRangeMin={projectData.accuracyRangeMin}
            accuracyRangeMax={projectData.accuracyRangeMax}
            maxImages={projectData.maxImages}
            onChange={onChange}
          />
        )}
        <CameraFPSOptions
          setFpsManually={projectData.setFpsManually}
          fps={projectData.fps}
          recomendedFps={projectData.recomendedFps}
          onChange={onChange}
        />
        {inferenceSource === InferenceSource.LVA && (
          <>
            <SendVideoOptions
              SVTCisOpen={projectData.SVTCisOpen}
              SVTCcameras={projectData.SVTCcameras}
              SVTCparts={projectData.SVTCparts}
              SVTCconfirmationThreshold={projectData.SVTCconfirmationThreshold}
              SVTCRecordingDuration={projectData.SVTCRecordingDuration}
              SVTCEnableTracking={projectData.SVTCEnableTracking}
              onChange={onChange}
              selectedCameraOptions={selectedCameraOptions}
              selectedPartOptions={selectedPartOptions}
            />
            <ProtocolOptions inferenceProtocol={projectData.inferenceProtocol} onChange={onChange} />
          </>
        )}
        <DisableVideoOption disableVideoFeed={projectData.disableVideoFeed} onChange={onChange} />
      </Stack>
    </ExpandPanel>
  );
};
