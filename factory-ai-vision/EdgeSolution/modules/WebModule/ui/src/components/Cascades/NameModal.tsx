import {
  Stack,
  Modal,
  TextField,
  PrimaryButton,
  DefaultButton,
  IconButton,
  mergeStyleSets,
} from '@fluentui/react';
import React from 'react';

interface Props {
  onClose: () => void;
  onSave: () => void;
  setCascadeName: (value: React.SetStateAction<string>) => void;
  cascadeName: string;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      padding: '10px',
    },
  });

const NameModal = (props: Props) => {
  const { onClose, onSave, setCascadeName, cascadeName } = props;

  const classes = getClasses();

  return (
    <Modal isOpen={true} onDismiss={onClose} styles={{ main: classes.root }}>
      <Stack horizontalAlign="end">
        <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onClose} />
      </Stack>
      <Stack tokens={{ childrenGap: 15 }}>
        <TextField
          label="Input Cascade Name"
          value={cascadeName}
          onChange={(_, value: string) => setCascadeName(value)}
        />
        <Stack horizontal horizontalAlign="space-around">
          <PrimaryButton onClick={onSave}>Save</PrimaryButton>
          <DefaultButton onClick={onClose}>Cancel</DefaultButton>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NameModal;
