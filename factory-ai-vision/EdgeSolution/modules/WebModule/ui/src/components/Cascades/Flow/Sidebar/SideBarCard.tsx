import React, { useCallback } from 'react';
import { Stack, Text, Label } from '@fluentui/react';
import { Connection } from 'react-flow-renderer';

import { TrainingProject, NodeType } from '../../../../store/trainingProjectSlice';
import { getClasses } from './style';
import { getNodeImage } from '../../utils';
import { convertProjectType } from '../../../utils';

interface Props {
  model: TrainingProject;
  type: NodeType;
  connectMap: Connection[];
}

const isDraggableModel = (model: TrainingProject) => {
  const draggableNodeType = ['openvino_library', 'openvino_model', 'sink', 'source'] as NodeType[];

  if (
    model.is_trained &&
    model.nodeType === 'customvision_model' &&
    model.projectType === 'ObjectDetection' &&
    model.outputs.length !== 0
  )
    return true;
  if (draggableNodeType.includes(model.nodeType)) return true;
  return false;
};

const SideBarCard = (props: Props) => {
  const { model, type, connectMap } = props;

  const classes = getClasses();

  const onDragStart = useCallback(
    (event, nodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.setData('id', model.id);
      event.dataTransfer.setData('connectMap', JSON.stringify(connectMap));

      event.dataTransfer.effectAllowed = 'move';
    },
    [connectMap, model],
  );

  return (
    <>
      <Stack
        onDragStart={(event) => onDragStart(event, type)}
        draggable={isDraggableModel(model)}
        styles={{ root: classes.root }}
      >
        {!isDraggableModel(model) && <Stack className={classes.disableCover} />}
        <Stack horizontal>
          <img style={{ height: '60px', width: '60px' }} src={getNodeImage(type)} alt="icon" />
          <Stack styles={{ root: classes.titleWrapper }} horizontal horizontalAlign="space-between">
            {type === 'sink' ? (
              <Stack>
                <Label styles={{ root: classes.title }}>Export</Label>
              </Stack>
            ) : (
              <Stack>
                <Label styles={{ root: classes.title }}>{model.name}</Label>
                {type !== 'openvino_library' && (
                  <Text styles={{ root: classes.label }}>{convertProjectType(model.projectType)}</Text>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
        {['openvino_model', 'customvision_model'].includes(type) && (
          <Stack styles={{ root: classes.bottomWrapper }}>
            <Label styles={{ root: classes.smallLabel }}>
              {type === 'openvino_model' ? 'By Intel' : 'By Microsoft Custom Vision'}
            </Label>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default SideBarCard;
