import React, { useCallback, useState } from 'react';
import { Stack, Text, mergeStyleSets, IContextualMenuProps, IconButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Url } from '../../constant';
import { Cascade, deleteCascade, updateCascade, createCascade } from '../../store/cascadeSlice';

import NameModal from './NameModal';

interface Props {
  cascade: Cascade;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      boxShadow: '0px 1.6px 3.6px rgba(0, 0, 0, 0.132), 0px 0.3px 0.9px rgba(0, 0, 0, 0.108)',
      ':hover': {
        boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.5), 0px 1.6px 3.6px rgba(0, 0, 0, 0.5)',
      },
    },
  });

const CascadesCard = (props: Props) => {
  const { cascade } = props;

  const [isPopup, setIsPopup] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  const classes = getClasses();

  const onDeleteCascade = useCallback(async () => {
    await dispatch(deleteCascade(cascade.id));
  }, [dispatch, cascade]);

  const onEditCascadeName = useCallback(
    async (name: string) => {
      await dispatch(
        updateCascade({
          id: cascade.id,
          data: { ...cascade, name },
        }),
      );
      setIsPopup(false);
    },
    [dispatch, cascade],
  );

  const onDuplicateCascade = useCallback(async () => {
    await dispatch(
      createCascade({
        ...cascade,
        name: `${cascade.name} (1)`,
      }),
    );
  }, [dispatch, cascade]);

  const onDirectCascadeDetail = useCallback(() => {
    history.push(Url.CASCADES + '/' + cascade.id);
  }, [history, cascade]);

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'rename',
        text: 'Rename',
        iconProps: { iconName: 'Edit' },
        onClick: () => setIsPopup(true),
      },
      {
        key: 'duplicate',
        text: 'Duplicate',
        iconProps: { iconName: 'Copy' },
        onClick: onDuplicateCascade,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onDeleteCascade,
      },
    ],
  };

  return (
    <>
      <Stack
        styles={{
          root: classes.root,
        }}
        onClick={onDirectCascadeDetail}
      >
        <img style={{ width: '300px', height: '200px' }} src={cascade.screenshot} alt="cascadeCover" />
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
      {isPopup && (
        <NameModal
          onClose={() => setIsPopup(false)}
          cascadeName={cascade.name}
          onSave={(name: string) => onEditCascadeName(name)}
        />
      )}
    </>
  );
};

export default CascadesCard;
