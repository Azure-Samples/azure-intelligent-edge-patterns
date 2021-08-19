import React, { memo } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton, mergeStyleSets } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { NodeType, TrainingProject } from '../../../../store/trainingProjectSlice';
import { getSourceMetadata, getTargetMetadata, isValidConnection } from './utils';
import { getModel } from '../../utils';

interface Props {
  id: string;
  type: NodeType;
  setElements: any;
  onDelete: () => void;
  modelList: TrainingProject[];
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

const getNodeImage = (type: NodeType) => {
  if (type === 'openvino_model') return '/icons/modelCard.png';
  if (type === 'openvino_library') return '/icons/transformCard.png';
  if (type === 'sink') return '/icons/exportCard.png';
};

const getHandlePointer = (length: number, id) => {
  if (length === 1) return 150;
  if (length === 2) return id * 100 + 100;
  if (length === 3) return id * 75 + 75;
  return 150;
};

const NodeCard = (props: Props) => {
  const { id, type, setElements, onDelete, modelList } = props;

  const classes = getClasses();
  const selectedModel = getModel(id, modelList);

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
        onClick: () => onDelete(),
      },
    ],
  };

  return (
    <>
      {type !== 'sink' &&
        selectedModel.inputs.map((_, id) => (
          <Handle
            key={id}
            id={`${id}`}
            // @ts-ignore
            position="top"
            type="target"
            style={{ left: getHandlePointer(selectedModel.inputs.length, id) }}
            onConnect={(params) => setElements((els) => addEdge(params, els))}
            isConnectable={true}
            isValidConnection={(connection: Connection) => {
              return isValidConnection(
                getSourceMetadata(connection, getModel(connection.source, modelList)),
                getTargetMetadata(connection, selectedModel),
              );
            }}
          />
        ))}
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
      {type !== 'sink' && (
        <>
          {selectedModel.outputs.map((_, id) => (
            // @ts-ignore
            <Handle
              key={id}
              id={id.toString()}
              // @ts-ignore
              position="bottom"
              type="source"
              style={{ left: getHandlePointer(selectedModel.outputs.length, id) }}
              isConnectable={true}
              onConnect={(params) => setElements((els) => addEdge(params, els))}
              isValidConnection={(connection: Connection) =>
                isValidConnection(
                  getSourceMetadata(connection, selectedModel),
                  getTargetMetadata(connection, getModel(connection.target, modelList)),
                )
              }
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(NodeCard);
