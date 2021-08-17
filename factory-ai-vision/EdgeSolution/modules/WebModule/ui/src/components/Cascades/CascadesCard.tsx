import React, { useCallback } from 'react';
import {
  Stack,
  Label,
  PrimaryButton,
  Text,
  mergeStyleSets,
  IContextualMenuProps,
  IconButton,
} from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Url } from '../../enums';
import { Cascade, deleteCascade } from '../../store/cascadeSlice';

interface Props {
  cascade: Cascade;
}

const CascadesCard = (props: Props) => {
  const { cascade } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const onDeleteCascade = useCallback(async () => {
    await dispatch(deleteCascade(cascade.id));
  }, [dispatch, cascade]);

  const onDirectCascadeDetail = useCallback(() => {
    history.push(Url.CASCADES + '/' + cascade.id);
  }, []);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'rename',
        text: 'Rename',
        iconProps: { iconName: 'Edit' },
        onClick: () => {},
      },
      // {
      //   key: 'deploy',
      //   text: 'Deploy',
      //   iconProps: { iconName: 'CodeEdit' },
      //   onClick: () => {},
      // },
      {
        key: 'duplicate',
        text: 'Duplicate',
        iconProps: { iconName: 'Copy' },
        onClick: () => {},
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: () => onDeleteCascade(),
      },
    ],
  };

  return (
    <Stack
      styles={{
        root: {
          boxShadow: '0px 1.6px 3.6px rgba(0, 0, 0, 0.132), 0px 0.3px 0.9px rgba(0, 0, 0, 0.108);',
        },
      }}
      onClick={onDirectCascadeDetail}
    >
      <img style={{ width: '300px', height: '200px' }} alt="cascadeCover" />
      <Stack styles={{ root: { padding: '12px 16px' } }} horizontal horizontalAlign="space-between">
        <Stack>
          <Text styles={{ root: { fontSize: '10px', lineHeight: '14px' } }}>SECTION 29004</Text>
          <Text styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>{cascade.name}</Text>
        </Stack>
        <IconButton
          styles={{ root: { color: '#212121' } }}
          menuProps={menuProps}
          menuIconProps={{ iconName: 'More' }}
        />
      </Stack>
    </Stack>
  );
};

export default CascadesCard;
