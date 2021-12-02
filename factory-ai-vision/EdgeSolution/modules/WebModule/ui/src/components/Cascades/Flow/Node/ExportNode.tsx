import React, { memo, useState, useCallback } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton } from '@fluentui/react';
import { Handle, addEdge, Connection, Node, Edge, isNode } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';
import { getExportNodeClasses } from './styles';
import { isValidConnection } from './utils';
import { getModel } from '../../utils';

interface Props {
  id: string;
  data: {
    id: string;
    name: string;
  };
  setElements: any;
  onDelete: () => void;
  onSelected: () => void;
  modelList: TrainingProject[];
  connectMap: Connection[];
}

const ExportNode = (props: Props) => {
  const { setElements, onDelete, onSelected, data, modelList, id, connectMap } = props;
  const { name } = data;

  const classes = getExportNodeClasses();

  const selectedModel = getModel(id, modelList);
  const [isHover, setIsHover] = useState(false);

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
      <Handle
        id={`0`}
        // @ts-ignore
        position="top"
        type="target"
        style={{
          left: 150,
        }}
        onConnect={onConnectEdge}
        isValidConnection={(connection: Connection) => {
          return isValidConnection(
            getModel(connection.source, modelList),
            selectedModel,
            connection,
            connectMap,
          );

          // return isValidConnection(
          //   getSourceMetadata(connection, getModel(connection.source, modelList)),
          //   getTargetMetadata(connection, selectedModel),
          // );
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      />
      {isHover && (
        <Stack styles={{ root: { position: 'absolute', top: '-60px' } }} tokens={{ childrenGap: 2 }}>
          <Stack>
            <Stack>only bounding_box,</Stack>
            <Stack>classification,</Stack>
            <Stack>regression</Stack>
          </Stack>
        </Stack>
      )}
      <Stack horizontal styles={{ root: classes.node }}>
        <img
          style={{ height: '60px', width: '60px' }}
          src="/icons/exportCard.png"
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack styles={{ root: classes.nodeWrapper }}>
          <Text styles={{ root: classes.title }}>{name}</Text>
        </Stack>
        <Stack verticalAlign="center">
          <IconButton
            className={classes.controlBtn}
            menuProps={menuProps}
            menuIconProps={{ iconName: 'MoreVertical' }}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default memo(ExportNode);
