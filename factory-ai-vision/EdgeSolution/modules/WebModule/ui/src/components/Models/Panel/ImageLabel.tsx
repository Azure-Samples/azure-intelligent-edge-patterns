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
import { Url } from '../../../enums';
import { useInterval } from '../../../hooks/useInterval';
import { NO_LIMIt_TRAIN_STATUS } from '../type';

interface Props {
  project: TrainingProject;
  status: TrainingStatus;
  parts: Part[];
}

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

const isObjectDetectionDisable = (
  status: TrainingStatus,
  labeledImageCounts: number[],
  hasTrainProject: boolean,
): boolean => {
  if (
    ((hasTrainProject && Math.max(...labeledImageCounts) > 0) ||
      (!hasTrainProject && Math.min(...labeledImageCounts) >= 15)) &&
    NO_LIMIt_TRAIN_STATUS.includes(status)
  )
    return false;

  return true;
};

const getLabeledImageCount = (counts: number[], hasTrainProject: boolean): string => {
  if (hasTrainProject && Math.max(...counts) !== 0) return `${Math.max(...counts)} tagged`;
  if (!hasTrainProject) return `${Math.min(...counts)} tagged`;
  return 'Tag images';
};

const getUnTrainImageCounts = (parts: Part[]) => {
  const counts = parts.map((part) => part.local_image_count);

  return counts;
};

const ImageLabel = (props: Props) => {
  const { project, status, parts } = props;

  const [localStatus, setLocalStatus] = useState<TrainingStatus>(status);

  const hasTrainProject = parts.every((part) => part.remote_image_count >= 15);
  const labeledImageCounts = getUnTrainImageCounts(parts);

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
  }, []);

  return (
    <div>
      <Label styles={{ root: classes.itemTitle }}>Images</Label>
      <Text styles={{ root: classes.tips }}>
        {project.projectType === 'ObjectDetection'
          ? 'At least 15 images must be tagged per object'
          : 'At least 15 images must be classified'}
      </Text>
      <Stack>
        <Link onClick={onDirectToImages}>
          <Stack
            styles={{ root: { color: '#0078D4' } }}
            horizontal
            verticalAlign="center"
            tokens={{ childrenGap: 5 }}
          >
            <Text>{getLabeledImageCount(labeledImageCounts, hasTrainProject)}</Text>
            <Icon iconName="OpenInNewWindow" />
          </Stack>
        </Link>
      </Stack>
      <DefaultButton
        styles={{ root: { marginTop: '14px' } }}
        disabled={isObjectDetectionDisable(localStatus, labeledImageCounts, hasTrainProject)}
        onClick={onTrainClick}
      >
        Train
      </DefaultButton>
      {!NO_LIMIt_TRAIN_STATUS.includes(localStatus) && (
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
