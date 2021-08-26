import React, { memo, useState } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton, mergeStyleSets } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { NodeType, TrainingProject } from '../../../../store/trainingProjectSlice';
import { getSourceMetadata, getTargetMetadata, isValidConnection } from './utils';
import { getModel, getNodeImage } from '../../utils';

interface Props {
  id: string;
  type: NodeType;
  setElements: any;
  onDelete: () => void;
  modelList: TrainingProject[];
  onSelected: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    node: {
      padding: 0,
      width: '300px',
      boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      border: 'none',
      backgroundColor: '#FFF',
    },
    nodeWrapper: { padding: '10px 12px', width: '220px' },
    title: { fontSize: '14px', lineHeight: '20px' },
    label: { fontSize: '14px', lineHeight: '20px', color: '#605E5C' },
    controlBtn: {
      padding: '10px',
      marginRight: '12px',
      justifyContent: 'center',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
  });

const getHandlePointer = (length: number, id) => {
  if (length === 1) return 150;
  if (length === 2) return id * 100 + 100;
  if (length === 3) return id * 75 + 75;
  return 150;
};

const OUTPUTS_LIMIT_NAME = ['coordinates', 'confidences'];

const getEnhanceSelectedModel = (model: TrainingProject): TrainingProject => {
  if (model.nodeType === 'openvino_library')
    return { ...model, outputs: model.outputs.filter((output) => !OUTPUTS_LIMIT_NAME.includes(output.name)) };
  return model;
};

const Node = (props: Props) => {
  const { id, type, setElements, onDelete, modelList, onSelected } = props;

  const [selectedInput, setSelectedInput] = useState(-1);
  const [selectedOutput, setSelectedOutput] = useState(-1);

  const classes = getClasses();
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
            height: '10px',
            width: '10px',
            top: '-6px',
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
          <Stack>Shape: {`[${selectedModel.inputs[selectedInput].metadata.shape.join(',')}]`}</Stack>
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
          <Text styles={{ root: classes.title }}>{selectedModel.name}</Text>
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
            height: '10px',
            width: '10px',
            bottom: '-6px',
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
          <Stack>Shape: {`[${selectedModel.outputs[selectedOutput].metadata.shape.join(',')}]`}</Stack>
        </Stack>
      )}
    </>
  );
};

export default memo(Node);
