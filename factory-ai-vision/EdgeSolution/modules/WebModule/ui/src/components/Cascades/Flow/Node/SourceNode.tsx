import React, { useState, useCallback } from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import { Handle, addEdge, Connection, Node, Edge, isNode } from 'react-flow-renderer';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { TrainingProject, selectTrainingProjectById } from '../../../../store/trainingProjectSlice';
import { isValidConnection } from './utils';
import { getModel } from '../../utils';
import { getSourceNodeClasses } from './styles';

interface Props {
  id: string;
  setElements: any;
  modelList: TrainingProject[];
  connectMap: Connection[];
}

const SourceNode = (props: Props) => {
  const { id, setElements, modelList, connectMap } = props;

  const model = useSelector((state: RootState) => selectTrainingProjectById(state, id));

  const [isHover, setIsHover] = useState(false);
  const classes = getSourceNodeClasses();

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
      <Stack
        styles={{
          root: classes.root,
        }}
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 10 }}
      >
        <Icon styles={{ root: classes.title }} iconName="Camera" />
        <Text styles={{ root: classes.describe }}>Camera Input</Text>
      </Stack>
      {model.outputs.map((_, id) => (
        <Handle
          key={id}
          id={`${id}`}
          type="source"
          // @ts-ignore
          position="bottom"
          // @ts-ignore
          onConnect={onConnectEdge}
          isValidConnection={(connection: Connection) =>
            isValidConnection(model, getModel(connection.target, modelList), connection, connectMap)
          }
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        />
      ))}
      {isHover && (
        <Stack styles={{ root: { position: 'absolute', bottom: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {model.outputs[0].metadata.type}</Stack>
          <Stack>Shape: {`[${model.outputs[0].metadata.shape.join(',')}]`}</Stack>
        </Stack>
      )}
    </>
  );
};

export default SourceNode;
