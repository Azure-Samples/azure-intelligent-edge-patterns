import React, { useState, useCallback, useEffect } from 'react';
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
import { useDispatch } from 'react-redux';

import { updateCustomVisionProjectTags, TrainingProject } from '../../../store/trainingProjectSlice';
import { TrainingStatus } from '../../../store/trainingProjectStatusSlice';
import { Part } from '../../../store/partSlice';

import Tag from '../Tag';
import ImageLabel from './ImageLabel';

type Props = {
  onDismiss: () => void;
  project: TrainingProject;
  parts: Part[];
  status: TrainingStatus;
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

const EditPanel: React.FC<Props> = (props) => {
  const { project, parts, onDismiss, status } = props;

  const [localTag, setLocalTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(project.name);

  const dispatch = useDispatch();
  const classes = getClasses();

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
            <ImageLabel project={project} status={status} parts={parts} />
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
