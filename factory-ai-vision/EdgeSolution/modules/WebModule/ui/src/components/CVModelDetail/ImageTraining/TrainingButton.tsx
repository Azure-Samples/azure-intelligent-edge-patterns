import React, { useCallback, useMemo, useState } from 'react';
import { Stack, DefaultButton, ProgressIndicator, Icon, Text, mergeStyleSets } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { ProjectType, trainCustomVisionProject } from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory, Part } from '../../../store/partSlice';
import {
  selectAllTrainingProjectsStatus,
  getOneTrainingProjectStatus,
} from '../../../store/trainingProjectStatusSlice';
import { State as RootState } from 'RootStateType';
import { TrainingStatus } from '../../../store/trainingProjectStatusSlice';
import { TrainStatus } from '../../../constant';
import { useInterval } from '../../../hooks/useInterval';

interface Props {
  cvModelId: number;
  projectType: ProjectType;
}

const getClasses = () =>
  mergeStyleSets({
    wrapper: {
      borderTop: 'rgba(204,204,204, 0.8) 1px solid',
      padding: '10px 20px',
      bottom: 0,
      width: '100%',
      position: 'absolute',
    },
    item: { fontSize: '13px', lineHeight: '18px', color: '#000' },
    progressBar: {
      background:
        'linear-gradient(to right, rgb(237, 235, 233) 0%, rgba(19, 138, 0) 50%, rgb(237, 235, 233) 100%)',
    },
    tips: { fontSize: '14px', lineHeight: '20px', color: '#A19F9D' },
  });

const NO_LIMIT_TRAIN_STATUS: TrainStatus[] = ['ok', 'Failed', 'Success', 'No change'];
const OBJECT_DETECTION_TRAIN_LIMIT = 15;
const CLASSIFICATION_TRAIN_LIMIT = 5;
const limitCounting = (projectType: ProjectType) =>
  projectType === 'Classification' ? CLASSIFICATION_TRAIN_LIMIT : OBJECT_DETECTION_TRAIN_LIMIT;

const isCVModelTraining = (parts: Part[], limit: number): boolean => {
  // All remote tag bigger more than limit and local have at least one labeled image.
  const isAllTagBiggerLimit = parts.every((part) => part.remote_image_count >= limit);
  const hasLocalTag = parts.some((part) => part.local_image_count > 0);
  if (isAllTagBiggerLimit && hasLocalTag) return true;

  // All remote tag lower than limit and local >= limit labeled images.
  const isAllTagLowerLimit = parts.every((part) => part.remote_image_count < limit);
  const isLocalTagMoreThanLimit = parts.every((part) => part.local_image_count >= limit);
  if (isAllTagLowerLimit && isLocalTagMoreThanLimit) return true;

  // partial remote tag lower than limit and local >= limit labeled images.
  const isPartialTagLowerLimit = parts.some((part) => part.remote_image_count < limit);
  const isPartialTagMoreThanLimit = parts
    .filter((part) => part.remote_image_count < limit)
    .every((part) => part.local_image_count >= limit);
  if (isPartialTagLowerLimit && isPartialTagMoreThanLimit) return true;

  return false;
};

const getLocalLabelImageCount = (parts: Part[]) => {
  const localImageCountList = parts.map((part) => part.local_image_count);
  if (localImageCountList.every((count) => count === 0)) return 'Tag images';

  return parts.map((part) => `${part.name}:${part.local_image_count}`).join(', ');
};

const TrainingButton = (props: Props) => {
  const { cvModelId, projectType } = props;

  const classes = getClasses();
  const dispatch = useDispatch();

  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(cvModelId), [cvModelId]);
  const parts = useSelector(partSelector);
  const projectStatusList = useSelector((state: RootState) => selectAllTrainingProjectsStatus(state));

  const projectStatus = projectStatusList.find((status) => status.project === cvModelId);

  const trainingLimit = limitCounting(projectType);
  const isTraining =
    !isCVModelTraining(parts, trainingLimit) && NO_LIMIT_TRAIN_STATUS.includes(projectStatus.status);
  const localLabelImageCount = getLocalLabelImageCount(parts);

  const [localStatus, setLocalStatus] = useState<TrainingStatus>(projectStatus.status);

  useInterval(async () => {
    const response = await dispatch(getOneTrainingProjectStatus(cvModelId));
    // @ts-ignore
    const { status } = response.payload;

    setLocalStatus(status);
  }, 5000);

  const onTrainClick = useCallback(() => {
    dispatch(trainCustomVisionProject(cvModelId));
  }, [dispatch, cvModelId]);

  return (
    <Stack styles={{ root: classes.wrapper }} horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
      <DefaultButton text="Train" style={{ width: '69px' }} onClick={onTrainClick} disabled={isTraining} />
      <Stack
        styles={{ root: { color: '#0078D4' } }}
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 5 }}
      >
        <Stack>
          <Text>{localLabelImageCount}</Text>
          <Text styles={{ root: classes.tips }}>
            {projectType === 'ObjectDetection'
              ? 'At least 15 images must be tagged per new object'
              : 'At least 5 images must be tagged per classification'}
          </Text>
        </Stack>
      </Stack>
      {!NO_LIMIT_TRAIN_STATUS.includes(localStatus) && (
        <Stack>
          <ProgressIndicator styles={{ progressBar: classes.progressBar }} />
          <Text>{localStatus}</Text>
        </Stack>
      )}
      {localStatus === 'Failed' && (
        <Stack horizontal styles={{ root: { marginTop: '7px' } }} tokens={{ childrenGap: 12 }}>
          <Icon iconName="StatusErrorFull" styles={{ root: { color: '#D83B01', fontSize: '20px' } }} />
          <Text styles={{ root: classes.item }}>Model retraining failed</Text>
        </Stack>
      )}
      {localStatus === 'Success' && (
        <Stack horizontal styles={{ root: { marginTop: '7px' } }} tokens={{ childrenGap: 12 }}>
          <Icon iconName="CompletedSolid" styles={{ root: { color: '#138A00', fontSize: '20px' } }} />
          <Text styles={{ root: classes.item }}>Model was successfully trained</Text>
        </Stack>
      )}
      {localStatus === 'No change' && (
        <Stack horizontal styles={{ root: { marginTop: '7px' } }} tokens={{ childrenGap: 12 }}>
          <Icon iconName="ExploreContent" styles={{ root: { color: '#D83B01', fontSize: '20px' } }} />
          <Text styles={{ root: classes.item }}>No newly-tagged images for retraining model</Text>
        </Stack>
      )}
    </Stack>
  );
};

export default TrainingButton;
