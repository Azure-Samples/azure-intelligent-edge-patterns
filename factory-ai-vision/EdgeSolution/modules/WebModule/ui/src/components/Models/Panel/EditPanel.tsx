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
import { useHistory, generatePath } from 'react-router-dom';

import { TrainingProject } from '../../../store/trainingProjectSlice';
import { Part } from '../../../store/partSlice';
import { Url } from '../../../enums';

import Tag from '../Tag';

type Props = {
  isOpen: boolean;
  project: TrainingProject;
  parts: Part[];
  onDissmiss: () => void;
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
  const { isOpen, project, parts, onDissmiss } = props;

  const [localTag, setLocalTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const onSaveModelClick = useCallback(() => {
    console.log('project', project.id);
    console.log('localTags', localTags);
  }, [project, localTags]);

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText="Edit Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          <PrimaryButton onClick={onSaveModelClick} text="Save" />
          <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Source</Label>
          <Text styles={{ root: classes.item }}>Microsoft Custom Vision</Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
          <Text styles={{ root: classes.item }}>True</Text>
        </Stack>
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
    </Panel>
  );
};

export default EditPanel;
