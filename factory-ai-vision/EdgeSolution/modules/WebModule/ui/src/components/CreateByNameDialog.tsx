import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
} from '@fluentui/react';

type CreateByNameDialogProps = {
  title: string;
  subText: string;
  hidden: boolean;
  onDismiss: () => void;
  onCreate: (name: string) => void;
};

export const CreateByNameDialog: React.FC<CreateByNameDialogProps> = ({
  title,
  subText,
  hidden,
  onDismiss,
  onCreate,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const onCreateClick = async () => {
    setLoading(true);
    await onCreate(name);
    setLoading(false);
    onDismiss();
  };

  const onTextChange = (_, newValue) => setName(newValue);

  return (
    <Dialog
      dialogContentProps={{
        title,
        subText,
      }}
      hidden={hidden}
      onDismiss={onDismiss}
    >
      <ProgressIndicator barHeight={loading ? 2 : 0} />
      <TextField onChange={onTextChange} disabled={loading} data-testid="location-input" />
      <DialogFooter>
        <PrimaryButton text="Create" onClick={onCreateClick} disabled={loading || !name} />
        <DefaultButton text="Cancel" onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
