import React, { useCallback } from 'react';
import { Stack, Text, Label, Link, IContextualMenuProps, IconButton } from '@fluentui/react';

import { TrainingProject, NodeType } from '../../../../store/trainingProjectSlice';
import { getClasses } from './style';

interface Props {
  model: TrainingProject;
  type: NodeType;
}

const getImage = (type: NodeType) => {
  if (type === 'openvino_model') return '/icons/modelCard.png';
  if (type === 'openvino_library') return '/icons/transformCard.png';
  if (type === 'sink') return '/icons/exportCard.png';
};

const Model = (props: Props) => {
  const { model, type } = props;

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
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
      },
    ],
  };

  return (
    <Stack
      onDragStart={(event) => onDragStart(event, type, model.id)}
      draggable
      styles={{ root: classes.root }}
    >
      <Stack horizontal>
        <img style={{ height: '60px', width: '60px' }} src={getImage(type)} alt="icon" />
        <Stack styles={{ root: classes.titleWrapper }} horizontal horizontalAlign="space-between">
          {type === 'sink' ? (
            <Stack>
              <Label styles={{ root: classes.title }}>export.json</Label>
              <Text styles={{ root: classes.label }}>Export</Text>
            </Stack>
          ) : (
            <Stack>
              <Label styles={{ root: classes.title }}>{model.name}</Label>
              <Text styles={{ root: classes.label }}>{model.projectType}</Text>
            </Stack>
          )}
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
        {type === 'openvino_model' && <Label styles={{ root: classes.smallLabel }}>By Intel</Label>}
        <Link styles={{ root: classes.addLabel }}>add</Link>
      </Stack>
    </Stack>
  );
};

export default Model;