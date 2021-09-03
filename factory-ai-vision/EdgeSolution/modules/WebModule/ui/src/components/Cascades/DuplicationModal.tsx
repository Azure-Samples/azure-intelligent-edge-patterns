import { Stack, Modal, Label, PrimaryButton, mergeStyleSets } from '@fluentui/react';
import React from 'react';

interface Props {
  onClose: () => void;
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
    },
  });

const NameModal = (props: Props) => {
  const { onClose } = props;

  const classes = getClasses();

  return (
    <Modal isOpen={true} onDismiss={onClose} styles={{ main: classes.root }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Label styles={{ root: classes.title }}>No same export name accepted</Label>
        <Stack horizontal horizontalAlign="space-around">
          <PrimaryButton onClick={onClose}>OK</PrimaryButton>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NameModal;
