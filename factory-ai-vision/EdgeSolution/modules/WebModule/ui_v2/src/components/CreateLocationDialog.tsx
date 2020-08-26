import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
} from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { postLocation } from '../store/locationSlice';

type CreateLocationDialogProps = {
  hidden: boolean;
  onDismiss: () => void;
  onCreatSuccess: (locationId: number) => void;
};

export const CreateLocationDialog: React.FC<CreateLocationDialogProps> = ({
  hidden,
  onDismiss,
  onCreatSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const onCreate = async () => {
    setLoading(true);
    const res = await dispatch(postLocation({ name }));
    onCreatSuccess((res as any).payload.id);
    setLoading(false);
    onDismiss();
  };

  const onTextChange = (_, newValue) => setName(newValue);

  return (
    <Dialog
      dialogContentProps={{
        title: 'Create location',
        subText: 'Enter the location where this camera is pointed:',
      }}
      hidden={hidden}
      onDismiss={onDismiss}
    >
      <ProgressIndicator barHeight={loading ? 2 : 0} />
      <TextField onChange={onTextChange} disabled={loading} />
      <DialogFooter>
        <PrimaryButton text="Create" onClick={onCreate} disabled={loading || !name} />
        <DefaultButton text="Cancel" onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
