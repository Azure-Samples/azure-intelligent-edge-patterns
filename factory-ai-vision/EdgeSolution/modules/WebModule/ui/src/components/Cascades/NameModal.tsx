import {
  Stack,
  Modal,
  TextField,
  PrimaryButton,
  DefaultButton,
  IconButton,
  mergeStyleSets,
} from '@fluentui/react';
import React, { useState, useCallback } from 'react';

interface Props {
  onClose: () => void;
  onSave: (value: string) => void;
  cascadeName: string;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      padding: '10px',
    },
  });

const NameModal = (props: Props) => {
  const { onClose, onSave, cascadeName } = props;

  const [localName, setLocalName] = useState(cascadeName);

  const onSaveName = useCallback(() => {
    onSave(localName);
    onClose();
  }, [localName, onClose, onSave]);

  const classes = getClasses();

  return (
    <Modal isOpen={true} onDismiss={onClose} styles={{ main: classes.root }}>
      <Stack horizontalAlign="end">
        <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onClose} />
      </Stack>
      <Stack tokens={{ childrenGap: 15 }}>
        <TextField
          label="Input Cascade Name"
          value={localName}
          onChange={(_, value: string) => setLocalName(value)}
        />
        <Stack horizontal horizontalAlign="space-around">
          <PrimaryButton onClick={onSaveName}>Save</PrimaryButton>
          <DefaultButton onClick={onClose}>Cancel</DefaultButton>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NameModal;
