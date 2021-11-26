import React, { useState } from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';
import { getSourceMetadata, getTargetMetadata, isValidConnection } from './utils';
import { getModel } from '../../utils';
import { getSourceNodeClasses } from './styles';

interface Props {
  id: string;
  setElements: any;
  modelList: TrainingProject[];
}

const SourceNode = (props: Props) => {
  const { id, setElements, modelList } = props;

  const [isHover, setIsHover] = useState(false);

  const classes = getSourceNodeClasses();

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
      {selectedModel.outputs.map((_, id) => (
        <Handle
          key={id}
          id={`${id}`}
          type="source"
          // @ts-ignore
          position="bottom"
          // @ts-ignore
          onConnect={(params) => setElements((els) => addEdge(params, els))}
          isValidConnection={(connection: Connection) =>
            isValidConnection(
              getSourceMetadata(connection, selectedModel),
              getTargetMetadata(connection, getModel(connection.target, modelList)),
            )
          }
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        />
      ))}
      {isHover && (
        <Stack styles={{ root: { position: 'absolute', bottom: '-45px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>Type: {selectedModel.outputs[0].metadata.type}</Stack>
          <Stack>Shape: {`[${selectedModel.outputs[0].metadata.shape.join(',')}]`}</Stack>
        </Stack>
      )}
    </>
  );
};

export default SourceNode;
