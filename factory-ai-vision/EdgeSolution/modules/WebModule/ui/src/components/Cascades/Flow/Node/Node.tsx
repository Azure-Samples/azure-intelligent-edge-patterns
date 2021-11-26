import React, { memo, useState } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { NodeType, TrainingProject } from '../../../../store/trainingProjectSlice';
import { getSourceMetadata, getTargetMetadata, isValidConnection } from './utils';
import { getModel, getNodeImage } from '../../utils';
import { getNodeClasses } from './styles';

interface Props {
  id: string;
  type: NodeType;
  setElements: any;
  onDelete: () => void;
  modelList: TrainingProject[];
  onSelected: () => void;
}

const getHandlePointer = (length: number, id) => {
  if (length === 1) return 150;
  if (length === 2) return id * 100 + 100;
  if (length === 3) return id * 75 + 75;
  return 150;
};

const LIMIT_OUTPUTS_NAME = ['coordinates', 'confidences', 'label_ids'];

const getEnhanceSelectedModel = (model: TrainingProject): TrainingProject => {
  if (model.nodeType === 'openvino_library')
    return { ...model, outputs: model.outputs.filter((output) => !LIMIT_OUTPUTS_NAME.includes(output.name)) };
  return model;
};

const Node = (props: Props) => {
  const { id, type, setElements, onDelete, modelList, onSelected } = props;

  const [selectedInput, setSelectedInput] = useState(-1);
  const [selectedOutput, setSelectedOutput] = useState(-1);

  const classes = getNodeClasses();
  const selectedModel = getEnhanceSelectedModel(getModel(id, modelList));

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: onSelected,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onDelete,
      },
    ],
  };

  return (
    <>
      {selectedModel.inputs.map((_, id) => (
        <Handle
          key={id}
          id={`${id}`}
          // @ts-ignore
          position="top"
          type="target"
          style={{
            left: getHandlePointer(selectedModel.inputs.length, id),
          }}
          onConnect={(params) => setElements((els) => addEdge(params, els))}
          isConnectable={true}
          isValidConnection={(connection: Connection) => {
            return isValidConnection(
              getSourceMetadata(connection, getModel(connection.source, modelList)),
              getTargetMetadata(connection, selectedModel),
            );
          }}
          onMouseEnter={() => setSelectedInput(id)}
          onMouseLeave={() => setSelectedInput(-1)}
        />
      ))}
      {selectedInput !== -1 && (
        <Stack styles={{ root: { position: 'absolute', top: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {selectedModel.inputs[selectedInput].metadata.type}</Stack>
          <Stack>
            Shape: {`[${selectedModel.inputs[selectedInput].metadata.shape.filter((s) => s > 0).join(',')}]`}
          </Stack>
        </Stack>
      )}
      {type === 'sink' && (
        <Handle
          id={`0`}
          // @ts-ignore
          position="top"
          type="target"
          style={{ left: 150 }}
          onConnect={(params) => setElements((els) => addEdge(params, els))}
        />
      )}
      <Stack horizontal styles={{ root: classes.node }}>
        <img
          style={{ height: '60px', width: '60px' }}
          src={getNodeImage(type)}
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack styles={{ root: classes.nodeWrapper }}>
          <Text styles={{ root: classes.title }}>
            {selectedModel.name.length > 20 ? `${selectedModel.name.slice(0, 21)}...` : selectedModel.name}
          </Text>
          <Text styles={{ root: classes.label }}>
            {type === 'sink' ? 'Export' : selectedModel.projectType}
          </Text>
        </Stack>
        <Stack verticalAlign="center">
          <IconButton
            className={classes.controlBtn}
            menuProps={menuProps}
            menuIconProps={{ iconName: 'MoreVertical' }}
          />
        </Stack>
      </Stack>
      {selectedModel.outputs.map((_, id) => (
        <Handle
          key={id}
          id={id.toString()}
          // @ts-ignore
          position="bottom"
          type="source"
          style={{
            left: getHandlePointer(selectedModel.outputs.length, id),
          }}
          isConnectable={true}
          onConnect={(params) => setElements((els) => addEdge(params, els))}
          onMouseEnter={() => setSelectedOutput(id)}
          onMouseLeave={() => setSelectedOutput(-1)}
          isValidConnection={(connection: Connection) =>
            isValidConnection(
              getSourceMetadata(connection, selectedModel),
              getTargetMetadata(connection, getModel(connection.target, modelList)),
            )
          }
        />
      ))}
      {selectedOutput !== -1 && (
        <Stack styles={{ root: { position: 'absolute', bottom: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {selectedModel.outputs[selectedOutput].metadata.type}</Stack>
          <Stack>
            Shape:{' '}
            {`[${selectedModel.outputs[selectedOutput].metadata.shape.filter((s) => s > 0).join(',')}]`}
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default memo(Node);
