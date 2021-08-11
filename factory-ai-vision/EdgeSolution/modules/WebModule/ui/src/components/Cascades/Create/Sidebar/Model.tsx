import React, { useCallback } from 'react';
import {
  Stack,
  ActionButton,
  Icon,
  Text,
  Label,
  Link,
  IContextualMenuProps,
  IconButton,
} from '@fluentui/react';

import { TrainingProject } from '../../../../store/trainingProjectSlice';
import { getClasses } from './style';

interface Props {
  model: TrainingProject;
}

const Model = (props: Props) => {
  const { model } = props;

  const classes = getClasses();

  const onDragStart = useCallback((event, nodeType, selectId) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('id', selectId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        // onClick: () => setIsEdit(true),
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        // onClick: () => setIsOpenDialog(true),
      },
    ],
  };

  return (
    <Stack
      onDragStart={(event) => onDragStart(event, 'model', model.id)}
      draggable
      styles={{ root: classes.root }}
    >
      <Stack horizontal>
        <img style={{ height: '60px', width: '60px' }} src="/icons/modelCard.png" alt="icon" />
        <Stack styles={{ root: classes.titleWrapper }} horizontal horizontalAlign="space-between">
          <Stack>
            <Label styles={{ root: classes.title }}>{model.name}</Label>
            <Text styles={{ root: classes.label }}>{model.projectType}</Text>
          </Stack>
          <Stack verticalAlign="center">
            <IconButton
              className={classes.controlBtn}
              menuProps={menuProps}
              menuIconProps={{ iconName: 'MoreVertical' }}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack styles={{ root: classes.bottomWrapper }}>
        <Label styles={{ root: classes.smallLabel }}>By Microsoft Cognitive Services</Label>
        <Link styles={{ root: classes.addLabel }}>add</Link>
      </Stack>
    </Stack>
  );
};

export default Model;
