import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  Label,
  TextField,
  mergeStyleSets,
  Text,
  Link,
  Icon,
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import Axios from 'axios';

import { State as RootState } from 'RootStateType';
import {
  updateCustomVisionProjectTags,
  selectTrainingProjectById,
  TrainingProject,
  trainCustomVisionProject,
} from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory, Part } from '../../../store/partSlice';
import { Url } from '../../../enums';
import { useInterval } from '../../../hooks/useInterval';

import Tag from '../Tag';

type TrainingStatus = 'ok' | 'training' | 'failed' | 'success' | 'No change';

type Props = {
  projectId: string;
  onDismiss: () => void;
  project: TrainingProject;
  parts: Part[];
  labeledCount: number;
};

const getClasses = () =>
  mergeStyleSets({
    itemWrapper: {
      marginTop: '25px',
    },
    itemTitle: { fontSize: '13px', lineHeight: '18px', color: '#605E5C' },
    item: { fontSize: '13px', lineHeight: '18px', color: '#000' },
    itemLink: { fontSize: '13px', lineHeight: '18px' },
    tagsWrapper: {
      marginTop: '20px',
    },
    tips: { fontSize: '14px', lineHeight: '20px', color: '#A19F9D' },
  });

const convertProjectType = (project: TrainingProject): string => {
  if (project.projectType === 'ObjectDetection') return 'Object Detector';
  return 'Classification';
};

const isDisableTrainButton = (status: TrainingStatus, labeledCount: number): boolean => {
  if (!['ok', 'training', 'failed', 'success'].includes(status) || labeledCount < 15) return true;
  return false;
};

const EditPanel: React.FC<Props> = (props) => {
  const { project, parts, onDismiss, labeledCount } = props;

  const [localTag, setLocalTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(project.name);
  const [localStatus, setLocalStatus] = useState<TrainingStatus>(null);

  const dispatch = useDispatch();
  const history = useHistory();
  const classes = getClasses();

  useEffect(() => {
    Axios.get(`/api/training_status/${project.id}`).then(({ data }) => {
      console.log('useEffect', data.status);
      setLocalStatus(data.status);
      return;
    });
  }, []);

  useInterval(() => {
    Axios.get(`/api/training_status/${project.id}`).then(({ data }) => {
      console.log('data', data.status);
      setLocalStatus(data.status);
    });
  }, 5000);

  useEffect(() => {
    setLocalTags([...parts].map((part) => part.name));
  }, [parts]);

  const onTagAdd = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && localTag !== '') {
        if (localTags.find((tag) => tag === localTag)) {
          setLocalTag('');
          return;
        }

        setLocalTags((prev) => [...prev, localTag]);
        setLocalTag('');
      }
    },
    [localTag, localTags],
  );

  const onRemoveTag = useCallback(
    (idx: number) => {
      const newTags = [...localTags];
      newTags.splice(idx, 1);

      setLocalTags(newTags);
    },
    [localTags],
  );

  const onSaveModelClick = useCallback(async () => {
    setIsLoading(true);

    await dispatch(updateCustomVisionProjectTags({ id: project.id.toString(), tags: localTags }));

    setIsLoading(false);
    onDismiss();
  }, [dispatch, project, localTags, onDismiss]);

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
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="Edit Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          <PrimaryButton onClick={onSaveModelClick} text="Save" disabled={isLoading} />
          <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Source</Label>
          <Text styles={{ root: classes.item }}>
            {project.category === 'openvino' ? 'Intel' : 'Microsoft Custom Vision'}
          </Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
          <Text styles={{ root: classes.item }}>{project.category === 'openvino' ? 'False' : 'True'}</Text>
        </Stack>
        {project.category === 'openvino' && (
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Category</Label>
            <Text styles={{ root: classes.item }}>{project.projectType}</Text>
          </Stack>
        )}
        {project.category === 'openvino' && (
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
            <Stack horizontal tokens={{ childrenGap: '8px' }} wrap>
              {project.outputs
                .filter((output) => output.metadata.labels)
                .map((output) =>
                  output.metadata.labels.map((label, id) => <Tag key={id} id={id} text={label} />),
                )}
            </Stack>
          </Stack>
        )}
        {project.category === 'openvino' && (
          <Stack>
            <TextField label="Name" value={name} onChange={(_, newValue) => setName(newValue)} required />
          </Stack>
        )}
        {project.category === 'customvision' && (
          <>
            <Stack>
              <Label styles={{ root: classes.itemTitle }}>Name</Label>
              <Stack>
                <Link
                  target="_blank"
                  href={`https://www.customvision.ai/projects/${project.customVisionId}#/manage`}
                >
                  <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                    <Text>{project.name}</Text>
                    <Icon styles={{ root: { color: '#0078D4' } }} iconName="OpenInNewWindow" />
                  </Stack>
                </Link>
              </Stack>
            </Stack>
            <Stack>
              <Label styles={{ root: classes.itemTitle }}>Type</Label>
              <Text styles={{ root: classes.item }}>{convertProjectType(project)}</Text>
            </Stack>
            <div>
              <Label styles={{ root: classes.itemTitle }}>Images</Label>
              <Text styles={{ root: classes.tips }}>At least 15 images must be tagged per object</Text>
              <Stack>
                <Link onClick={onDirectToImages}>
                  <Stack
                    styles={{ root: { color: '#0078D4' } }}
                    horizontal
                    verticalAlign="center"
                    tokens={{ childrenGap: 5 }}
                  >
                    <Text>{labeledCount === 0 ? `Tag Images` : `${labeledCount} tagged`}</Text>
                    <Icon iconName="OpenInNewWindow" />
                  </Stack>
                </Link>
              </Stack>
              <DefaultButton
                styles={{ root: { marginTop: '14px' } }}
                disabled={isDisableTrainButton(localStatus, labeledCount)}
                onClick={onTrainClick}
              >
                Train
              </DefaultButton>
              {!['failed', 'ok', 'success'].includes(localStatus) && (
                <Stack>
                  <ProgressIndicator
                    styles={{
                      progressBar: {
                        background:
                          'linear-gradient(to right, rgb(237, 235, 233) 0%, rgba(19, 138, 0) 50%, rgb(237, 235, 233) 100%)',
                      },
                    }}
                  />
                  <Text>{localStatus}</Text>
                </Stack>
              )}
              {localStatus === 'failed' && (
                <Stack horizontal styles={{ root: { marginTop: '7px' } }} tokens={{ childrenGap: 12 }}>
                  <Icon
                    iconName="StatusErrorFull"
                    styles={{ root: { color: '#D83B01', fontSize: '20px' } }}
                  />
                  <Text styles={{ root: classes.item }}>Model retraining failed</Text>
                </Stack>
              )}
              {localStatus === 'success' && (
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
          </>
        )}
      </Stack>
      {project.category === 'customvision' && (
        <Stack styles={{ root: classes.tagsWrapper }} tokens={{ childrenGap: '10px' }}>
          <TextField
            label="Objects/Tags"
            value={localTag}
            onChange={(_, newValue) => setLocalTag(newValue)}
            onKeyPress={onTagAdd}
            required
          />
          <Stack horizontal tokens={{ childrenGap: '8px' }} wrap>
            {localTags.map((part, id) => (
              <Tag key={id} id={id} text={part} isDelete onDelete={onRemoveTag} />
            ))}
          </Stack>
        </Stack>
      )}
    </Panel>
  );
};

export default EditPanel;
