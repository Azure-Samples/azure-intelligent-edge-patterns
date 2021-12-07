import { Stack, Modal, Label, PrimaryButton, mergeStyleSets } from '@fluentui/react';
import React from 'react';

import { CascadeError } from './types';

interface Props {
  onClose: () => void;
  cascadeError: CascadeError;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      padding: '20px',
      minHeight: 0,
    },
    title: {
      fontSize: '18px',
      lineHeight: '24px',
      textAlign: 'center',
    },
  });

const getErrorTitle = (cascadeError: CascadeError) => {
  switch (cascadeError) {
    case 'atLeastOneExport':
      return 'At least one export card';
    case 'discreteFlow':
      return 'Graph should be connected ';
    case 'nameDuplication':
      return 'No same cascade map name';
    case 'nodeDuplication':
      return 'No same export name';
    default:
      return '';
  }
};

const NameModal = (props: Props) => {
  const { onClose, cascadeError } = props;

  const classes = getClasses();

  return (
    <Modal isOpen={true} onDismiss={onClose} styles={{ main: classes.root }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Label styles={{ root: classes.title }}>{getErrorTitle(cascadeError)}</Label>
        <Stack horizontal horizontalAlign="space-around">
          <PrimaryButton onClick={onClose}>OK</PrimaryButton>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NameModal;
