import React, { memo, useState } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton } from '@fluentui/react';
import { Handle, addEdge, Connection } from 'react-flow-renderer';

import { TrainingProject } from '../../../../store/trainingProjectSlice';
import { getExportNodeClasses } from './styles';
import { getSourceMetadata, getTargetMetadata, isValidConnection } from './utils';
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
}

const ExportNode = (props: Props) => {
  const { setElements, onDelete, onSelected, data, modelList, id } = props;
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
        onConnect={(params) => setElements((els) => addEdge(params, els))}
        isValidConnection={(connection: Connection) => {
          return isValidConnection(
            getSourceMetadata(connection, getModel(connection.source, modelList)),
            getTargetMetadata(connection, selectedModel),
          );
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
