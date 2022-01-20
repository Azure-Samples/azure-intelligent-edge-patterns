import {
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
  ProgressIndicator,
  Rating,
  RatingSize,
  Stack,
  Text,
} from '@fluentui/react';
import Axios from 'axios';
import React, { useState } from 'react';
import { getErrorLog } from '../store/shared/createWrappedAsync';

type FeedbackDialogProps = {
  hidden: boolean;
  onDismiss: () => void;
};

const SATISFACTION = ['VB', 'PR', 'FR', 'GD', 'EX'];

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ hidden, onDismiss }) => {
  const [rating, setrating] = useState(5);
  const [loading, setLoading] = useState(false);

  const onRateChange = (_, newRating) => setrating(newRating);

  const onUpdate = async () => {
    setLoading(true);
    try {
      await Axios.post('/api/feedback', { satisfaction: SATISFACTION[rating - 1] });
      onDismiss();
    } catch (e) {
      alert(getErrorLog(e));
    }
    setLoading(false);
  };

  return (
    <Dialog
      hidden={hidden}
      onDismiss={onDismiss}
      minWidth={600}
      dialogContentProps={{
        title: 'Your feedback is greatly appreciated!',
        showCloseButton: true,
        onDismiss,
        styles: {
          header: {
            textAlign: 'center',
          },
        },
      }}
    >
      <ProgressIndicator progressHidden={!loading} />
      <Stack horizontalAlign="center">
        <Text variant="large">Rate your experience</Text>
        <Rating max={5} size={RatingSize.Large} rating={rating} onChange={onRateChange} />
      </Stack>
      <DialogFooter styles={{ actions: { display: 'flex', justifyContent: 'center' } }}>
        <PrimaryButton text="OK" disabled={loading} onClick={onUpdate} />
        <DefaultButton
          text="Give detail feedback"
          onClick={(): void => {
            window.open('https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues/new');
          }}
          disabled={loading}
        />
      </DialogFooter>
    </Dialog>
  );
};
