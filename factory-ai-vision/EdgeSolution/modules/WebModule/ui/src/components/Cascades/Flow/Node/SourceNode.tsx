import React, { useState } from 'react';
import { Stack, Text, Icon, mergeStyleSets } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';

interface Props {
  id: string;
  setElements: any;
  modelList: TrainingProject[];
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '150px',
      border: '1px solid #C4C4C4',
      borderRadius: '2px',
      padding: '15px',
      backgroundColor: '#FFF',
    },
    title: { fontSize: '24px' },
    describe: { fontSize: '14px', lineHeight: '20px' },
  });

const getModel = (id: string, modelList: TrainingProject[]) => {
  const re = /(?<=_).*/;

  const targetId = id.match(re)[0];
  return modelList.find((model) => model.id === parseInt(targetId, 10));
};

const getSourceMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.outputs[connect.sourceHandle].metadata);

const getTargetMetadata = (connect: Connection, model: TrainingProject) =>
  JSON.stringify(model.inputs[connect.targetHandle].metadata);

const isValidConnection = (sourceModelMetadata: string, targetModelMetadata: string) => {
  // console.log('sourceModel', sourceModelMetadata);
  // console.log('targetModel', targetModelMetadata);

  // const sourceModel = getModel(connection.source, ModelList);
  // const targetModel = getModel(connection.target, ModelList);

  // return connection.target === 'B';
  return true;
};

const SourceNode = (props: Props) => {
  const { id, setElements, modelList } = props;

  const [isBottomHandle, setIsBottomHandle] = useState(false);

  const classes = getClasses();

  const selectedModel = getModel(id, modelList);

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
      {selectedModel.outputs.map((output, id) => (
        <Handle
          key={id}
          id={`${id}`}
          type="source"
          // @ts-ignore
          position="bottom"
          // @ts-ignore
          onConnect={(params) => setElements((els) => addEdge(params, els))}
          style={{ height: '10px', width: '10px', bottom: '-6px' }}
          isValidConnection={(connection: Connection) =>
            isValidConnection(
              getSourceMetadata(connection, selectedModel),
              getTargetMetadata(connection, getModel(connection.target, modelList)),
            )
          }
          onMouseEnter={() => setIsBottomHandle(true)}
          onMouseLeave={() => setIsBottomHandle(false)}
        />
      ))}
      {isBottomHandle && (
        <Stack styles={{ root: { position: 'absolute' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {selectedModel.outputs[0].metadata.type}</Stack>
          <Stack>Shape: {`[${selectedModel.outputs[0].metadata.shape.join(',')}]`}</Stack>
        </Stack>
      )}
    </>
  );
};

export default SourceNode;
