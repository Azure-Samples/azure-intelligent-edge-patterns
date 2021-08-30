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

import { State as RootState } from 'RootStateType';
import {
  updateCustomVisionProjectTags,
  selectTrainingProjectById,
} from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';
import { Url } from '../../../enums';

import Tag from '../Tag';

type Props = {
  projectId: string;
  onDismiss: () => void;
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
  });

const EditPanel: React.FC<Props> = (props) => {
  const { projectId, onDismiss } = props;

  const project = useSelector((state: RootState) => selectTrainingProjectById(state, projectId));
  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(project.id), [project]);
  const parts = useSelector(partSelector);

  const [localTag, setLocalTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(project.name);

  const dispatch = useDispatch();
  const history = useHistory();
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

  const onLinkClick = useCallback(() => {
    history.push(
      generatePath(Url.IMAGES_DETAIL, {
        id: project.id,
      }),
    );
  }, [history, project]);

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
            {project.category === 'OVMS' ? 'Intel' : 'Microsoft Custom Vision'}
          </Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
          <Text styles={{ root: classes.item }}>{project.category === 'OVMS' ? 'False' : 'True'}</Text>
        </Stack>
        {project.category === 'OVMS' && (
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Category</Label>
            <Text styles={{ root: classes.item }}>{project.projectType}</Text>
          </Stack>
        )}
        {project.category === 'OVMS' && (
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
          </Stack>
        )}
        {project.category === 'OVMS' && (
          <Stack>
            <TextField label="Name" value={name} onChange={(_, newValue) => setName(newValue)} required />
          </Stack>
        )}
        {project.customVisionId && (
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
              <Label styles={{ root: classes.itemTitle }}>Images</Label>
              <Stack>
                <Link onClick={onLinkClick}>
                  <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                    <Text>Placeholder</Text>
                    <Icon styles={{ root: { color: '#0078D4' } }} iconName="OpenInNewWindow" />
                  </Stack>
                </Link>
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
      {project.customVisionId !== '' && (
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
