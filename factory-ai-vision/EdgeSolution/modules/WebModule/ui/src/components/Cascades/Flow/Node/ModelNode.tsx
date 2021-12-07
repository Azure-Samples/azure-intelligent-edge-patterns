import React, { memo, useState, useCallback } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton } from '@fluentui/react';
import { Handle, addEdge, Connection, Edge, Node, isNode } from 'react-flow-renderer';
import { useSelector } from 'react-redux';

import { NodeType, TrainingProject, selectTrainingProjectById } from '../../../../store/trainingProjectSlice';
import { isValidConnection } from './utils';
import { getModel, getNodeImage, getLimitOutputs } from '../../utils';
import { getNodeClasses } from './styles';
import { State as RootState } from 'RootStateType';

interface Props {
  id: string;
  type: NodeType;
  setElements: any;
  onDelete: () => void;
  modelList: TrainingProject[];
  onSelected: () => void;
  connectMap: Connection[];
}

const getHandlePointer = (length: number, id) => {
  if (length === 1) return 150;
  if (length === 2) return id * 100 + 100;
  if (length === 3) return id * 75 + 75;
  return 150;
};

const ModelNode = (props: Props) => {
  const { id, type, setElements, onDelete, modelList, onSelected, connectMap } = props;

  const model = useSelector((state: RootState) => selectTrainingProjectById(state, id));

  const [selectedInput, setSelectedInput] = useState(-1);
  const [selectedOutput, setSelectedOutput] = useState(-1);

  const classes = getNodeClasses();
  const refinedModel: TrainingProject = { ...model, outputs: getLimitOutputs(model.nodeType, model.outputs) };

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

  const onConnectEdge = useCallback(
    (params: Connection) =>
      setElements((els: (Node<any> | Edge<any>)[]) => {
        const newElements = els.map((element) => {
          if (isNode(element)) {
            return {
              ...element,
              data: {
                ...element.data,
                connectMap: [...(element.data.connectMap ?? []), params],
              },
            };
          }

          return element;
        });

        return addEdge(params, newElements);
      }),
    [setElements],
  );

  return (
    <>
      {refinedModel.inputs.map((_, id) => (
        <Handle
          key={id}
          id={`${id}`}
          // @ts-ignore
          position="top"
          type="target"
          style={{
            left: getHandlePointer(refinedModel.inputs.length, id),
          }}
          onConnect={onConnectEdge}
          isConnectable={true}
          isValidConnection={(connection: Connection) => {
            return isValidConnection(
              getModel(connection.source, modelList),
              refinedModel,
              connection,
              connectMap,
            );
          }}
          onMouseEnter={() => setSelectedInput(id)}
          onMouseLeave={() => setSelectedInput(-1)}
        />
      ))}
      {selectedInput !== -1 && (
        <Stack styles={{ root: { position: 'absolute', top: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {refinedModel.inputs[selectedInput].metadata.type}</Stack>
          <Stack>
            Shape: {`[${refinedModel.inputs[selectedInput].metadata.shape.filter((s) => s > 0).join(',')}]`}
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
            {refinedModel.name.length > 20 ? `${refinedModel.name.slice(0, 21)}...` : refinedModel.name}
          </Text>
          <Text styles={{ root: classes.label }}>
            {type === 'sink' ? 'Export' : refinedModel.projectType}
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
      {refinedModel.outputs.map((_, id) => (
        <Handle
          key={id}
          id={id.toString()}
          // @ts-ignore
          position="bottom"
          type="source"
          style={{
            left: getHandlePointer(refinedModel.outputs.length, id),
          }}
          isConnectable={true}
          onConnect={onConnectEdge}
          onMouseEnter={() => setSelectedOutput(id)}
          onMouseLeave={() => setSelectedOutput(-1)}
          isValidConnection={(connection: Connection) => {
            return isValidConnection(
              refinedModel,
              getModel(connection.target, modelList),
              connection,
              connectMap,
            );
          }}
        />
      ))}
      {selectedOutput !== -1 && (
        <Stack styles={{ root: { position: 'absolute', bottom: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {refinedModel.outputs[selectedOutput].metadata.type}</Stack>
          <Stack>
            Shape: {`[${refinedModel.outputs[selectedOutput].metadata.shape.filter((s) => s > 0).join(',')}]`}
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default memo(ModelNode);
