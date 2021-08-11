import React from 'react';
import { Stack, Text, IContextualMenuProps, IconButton, mergeStyleSets } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { Handle } from 'react-flow-renderer';

import { selectTrainingProjectById } from '../../../../store/trainingProjectSlice';
import { State as RootState } from 'RootStateType';

interface Props {
  modelId: string;
}

const getClasses = () =>
  mergeStyleSets({
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

const ModelCard = (props: Props) => {
  const { modelId } = props;

  const model = useSelector((state: RootState) => selectTrainingProjectById(state, modelId));

  const classes = getClasses();

  console.log('model', model);

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
      <Stack
        horizontal
        styles={{
          root: {
            padding: 0,
            width: '300px',
            boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
            border: 'none',
            backgroundColor: '#FFF',
          },
        }}
      >
        <img style={{ height: '60px', width: '60px' }} src="/icons/modelCard.png" alt="icon" />
        <Stack styles={{ root: { padding: '10px 12px', width: '220px' } }}>
          <Text>{model.name}</Text>
          <Text>{model.projectType}</Text>
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

export default ModelCard;
