import React, { useCallback, useState } from 'react';
import {
  Stack,
  DefaultButton,
  ProgressIndicator,
  Label,
  mergeStyleSets,
  Text,
  Link,
  Icon,
} from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { TrainingProject, trainCustomVisionProject } from '../../../store/trainingProjectSlice';
import { TrainingStatus, getOneTrainingProjectStatus } from '../../../store/trainingProjectStatusSlice';
import { Part } from '../../../store/partSlice';
import { Url } from '../../../constant';
import { useInterval } from '../../../hooks/useInterval';
import { NO_LIMIT_TRAIN_STATUS } from '../type';

interface Props {
  project: TrainingProject;
  status: TrainingStatus;
  parts: Part[];
}

const OBJECT_DETECTION_TRAIN_LIMIT = 15;
const CLASSIFICATION_TRAIN_LIMIT = 5;

const getClasses = () =>
  mergeStyleSets({
    itemTitle: { fontSize: '13px', lineHeight: '18px', color: '#605E5C' },
    item: { fontSize: '13px', lineHeight: '18px', color: '#000' },
    tips: { fontSize: '14px', lineHeight: '20px', color: '#A19F9D' },
    progressBar: {
      background:
        'linear-gradient(to right, rgb(237, 235, 233) 0%, rgba(19, 138, 0) 50%, rgb(237, 235, 233) 100%)',
    },
  });

const getIsTrainButton = (parts: Part[], limit: number): boolean => {
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

const ImageLabel = (props: Props) => {
  const { project, status, parts } = props;

  const [localStatus, setLocalStatus] = useState<TrainingStatus>(status);

  const trainingLimit =
    project.projectType === 'Classification' ? CLASSIFICATION_TRAIN_LIMIT : OBJECT_DETECTION_TRAIN_LIMIT;
  const isTrainButton = getIsTrainButton(parts, trainingLimit) && NO_LIMIT_TRAIN_STATUS.includes(status);
  const localLabelImageCount = getLocalLabelImageCount(parts);

  const classes = getClasses();
  const history = useHistory();
  const dispatch = useDispatch();

  useInterval(async () => {
    const response = await dispatch(getOneTrainingProjectStatus(project.id));
    // @ts-ignore
    const { status } = response.payload;

    setLocalStatus(status);
  }, 5000);

  const onDirectToImages = useCallback(() => {
    history.push(
      generatePath(Url.IMAGES_DETAIL, {
        id: project.id,
      }),
    );
  }, [history, project]);

  const onTrainClick = useCallback(() => {
    dispatch(trainCustomVisionProject(project.id));
  }, [dispatch, project]);

  return (
    <div>
      <Label styles={{ root: classes.itemTitle }}>Images</Label>
      <Text styles={{ root: classes.tips }}>
        {project.projectType === 'ObjectDetection'
          ? 'At least 15 images must be tagged per object'
          : 'At least 5 images must be tagged per classification'}
      </Text>
      <Stack>
        <Link onClick={onDirectToImages}>
          <Stack
            styles={{ root: { color: '#0078D4' } }}
            horizontal
            verticalAlign="center"
            tokens={{ childrenGap: 5 }}
          >
            <Text>{localLabelImageCount}</Text>
            <Icon iconName="OpenInNewWindow" />
          </Stack>
        </Link>
      </Stack>
      <DefaultButton
        styles={{ root: { marginTop: '14px' } }}
        disabled={!isTrainButton}
        onClick={onTrainClick}
      >
        Train
      </DefaultButton>
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
    </div>
  );
};

export default ImageLabel;
