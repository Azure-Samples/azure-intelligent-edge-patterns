import React, { memo, useState } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton, mergeStyleSets } from '@fluentui/react';
import { Handle, addEdge, Connection, Node } from 'react-flow-renderer';

import { NodeType, TrainingProject } from '../../../../store/trainingProjectSlice';
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

const ExportNode = (props: Props) => {
  const { id, setElements, onDelete, onSelected, data } = props;
  const { name } = data;

  const classes = getClasses();

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
          height: '10px',
          width: '10px',
          top: '-6px',
        }}
        onConnect={(params) => setElements((els) => addEdge(params, els))}
      />
      <Stack horizontal styles={{ root: classes.node }}>
        <img
          style={{ height: '60px', width: '60px' }}
          src="/icons/exportCard.png"
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack styles={{ root: classes.nodeWrapper }}>
          <Text styles={{ root: classes.title }}>{name}</Text>
          <Text styles={{ root: classes.label }}>Export</Text>
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
