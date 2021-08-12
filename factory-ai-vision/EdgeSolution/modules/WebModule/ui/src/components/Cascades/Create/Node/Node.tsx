import React, { memo } from 'react';
import { Stack, Text, IContextualMenuProps, IconButton, mergeStyleSets } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { Handle, addEdge } from 'react-flow-renderer';

import { selectTrainingProjectById } from '../../../../store/trainingProjectSlice';
import { State as RootState } from 'RootStateType';

type CascadeType = 'model' | 'custom' | 'export';
interface Props {
  modelId: string;
  type: CascadeType;
  setElements: any;
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

const getImage = (type: CascadeType) => {
  if (type === 'model') return '/icons/modelCard.png';
  if (type === 'custom') return '/icons/transformCard.png';
  if (type === 'export') return '/icons/exportCard.png';
};

const getHandlePointer = (length: number, id) => {
  if (length === 1) return 150;
  if (length === 2) return id * 100 + 100;
  if (length === 3) return id * 75 + 75;
  return 150;
};

const ModelCard = (props: Props) => {
  const { modelId, type, setElements } = props;

  const model = useSelector((state: RootState) => selectTrainingProjectById(state, modelId));

  const classes = getClasses();

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        // onClick: () => setIsEdit(true),
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        // onClick: () => setIsOpenDialog(true),
      },
    ],
  };

  return (
    <>
      {model.block_inputs.map((input, id) => (
        <Handle
          key={id}
          id={id.toString()}
          // @ts-ignore
          position="top"
          type="target"
          style={{ left: getHandlePointer(model.block_inputs.length, id) }}
          onConnect={(params) => setElements((els) => addEdge(params, els))}
        />
      ))}
      {type === 'export' && (
        <Handle
          id={model.id.toString()}
          // @ts-ignore
          position="top"
          type="target"
          style={{ left: 150 }}
          onConnect={(params) => setElements((els) => addEdge(params, els))}
        />
      )}
      <Stack horizontal styles={{ root: classes.node }}>
        <img style={{ height: '60px', width: '60px' }} src={getImage(type)} alt="icon" />
        <Stack styles={{ root: classes.nodeWrapper }}>
          <Text styles={{ root: classes.title }}>{model.name}</Text>
          <Text styles={{ root: classes.label }}>{type === 'export' ? 'Export' : model.projectType}</Text>
        </Stack>
        <Stack verticalAlign="center">
          <IconButton
            className={classes.controlBtn}
            menuProps={menuProps}
            menuIconProps={{ iconName: 'MoreVertical' }}
          />
        </Stack>
      </Stack>
      {/* 
      // @ts-ignore */}
      {/*
      <Handle
        type="source"
        // @ts-ignore
        position="right"
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#00F' }}
        isConnectable={true}
      /> */}

      {type !== 'export' && (
        <>
          {model.block_outputs.map((output, id) => (
            // @ts-ignore
            <Handle
              key={id}
              id={id.toString()}
              // @ts-ignore
              position="bottom"
              type="source"
              style={{ left: getHandlePointer(model.block_outputs.length, id) }}
              isConnectable={true}
              onConnect={(params) => setElements((els) => addEdge(params, els))}
            />
          ))}
        </>
      )}
    </>
  );
};

export default memo(ModelCard);
