import React, { useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Stack, DefaultButton, Label, TextField, Text } from '@fluentui/react';

import { trainingProjectPartsSelectorFactory, postPartByProject } from '../../../store/partSlice';
import { getTagsClasses } from './styles';
import { updateCustomVisionProjectTags } from '../../../store/trainingProjectSlice';

import Tag from '../../Models/Tag';

interface Props {
  modelId: number;
}

const Tags = (props: Props) => {
  const { modelId } = props;

  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(modelId), [modelId]);
  const parts = useSelector(partSelector);
  const dispatch = useDispatch();
  const classes = getTagsClasses();

  const [isAdd, setIsAdd] = useState(false);
  const [localPart, setLocalPart] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onTagSave = useCallback(async () => {
    const re = new RegExp('^\\w+', 'g');

    if (parts.find((part) => part.name === localPart) || !re.test(localPart)) {
      setLocalPart('');
      setIsAdd(false);
      return;
    }

    setIsLoading(true);

    await dispatch(
      postPartByProject({
        project: modelId,
        data: {
          name: localPart,
          description: '',
        },
      }),
    );

    setIsAdd(false);
    setLocalPart('');
    setIsLoading(false);
  }, [dispatch, localPart, parts, modelId]);

  const onTagRemove = useCallback(
    async (id) => {
      setIsLoading(true);

      await dispatch(
        updateCustomVisionProjectTags({
          id: modelId.toString(),
          tags: parts.filter((part) => part.id !== id).map((part) => part.name),
        }),
      );

      setIsLoading(false);
    },
    [dispatch, modelId, parts],
  );

  return (
    <>
      <Stack className={classes.root} tokens={{ childrenGap: 15 }}>
        <Label required>Objects / Tags</Label>
        <Stack className={classes.tagContainer} tokens={{ childrenGap: 7 }}>
          <Stack className={classes.tagWrapper} horizontal tokens={{ childrenGap: '5px' }}>
            {parts.map((part) => (
              <Tag
                key={part.id}
                id={part.id}
                text={part.name}
                count={part.remote_image_count}
                isDelete
                onDelete={onTagRemove}
              />
            ))}
            {isAdd && <TextField value={localPart} onChange={(_, newValue) => setLocalPart(newValue)} />}
          </Stack>
          <Stack horizontalAlign="space-between" horizontal>
            <Text>Add at least 2 tags to Save</Text>
            {isAdd ? (
              <DefaultButton
                className={classes.button}
                text="Save"
                onClick={onTagSave}
                disabled={isLoading}
              />
            ) : (
              <DefaultButton
                className={classes.button}
                text="Add"
                onClick={() => setIsAdd(isAdd ? false : true)}
                disabled={isLoading}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default Tags;
