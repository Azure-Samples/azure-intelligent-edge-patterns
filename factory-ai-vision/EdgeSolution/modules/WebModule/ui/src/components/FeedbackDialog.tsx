import React, { useState } from 'react';
import { Text, Flex, CloseIcon } from '@fluentui/react-northstar';
import Axios from 'axios';

import { Dialog } from './Dialog';
import { LoadingDialog, Status } from './LoadingDialog/LoadingDialog';
import { handleAxiosError } from '../util/handleAxiosError';
import { Rating } from './Rating';

const SATISFACTION = ['VB', 'PR', 'FR', 'GD', 'EX'];

const FeedbackDialog: React.FC<{ trigger: JSX.Element }> = ({ trigger }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rate, setRate] = useState(0);
  const [status, setStatus] = useState<Status>(Status.None);
  const [error, setError] = useState<Error>(null);

  const onUpdate = async (): Promise<void> => {
    setStatus(Status.Loading);
    try {
      await Axios.post('/api/feedback', { satisfaction: SATISFACTION[rate - 1] });
      setStatus(Status.Success);
    } catch (e) {
      setStatus(Status.Failed);
      setError(handleAxiosError(e));
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpen={(): void => setDialogOpen(true)}
        styles={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '30%',
        }}
        header="Your Feedback is greatly Appreciated!"
        content={
          <Flex column hAlign="center">
            <Text size="large" styles={{ padding: '20px' }}>
              Rate your experience
            </Text>
            <Rating max={5} value={rate} onChange={setRate} />
          </Flex>
        }
        cancelButton={{ content: 'OK', primary: true, disabled: rate <= 0, onClick: onUpdate }}
        confirmButton={{
          content: 'Help us improve',
          onClick: (): void => {
            window.open('https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues');
          },
        }}
        trigger={trigger}
        headerAction={{
          icon: <CloseIcon />,
          title: 'Close',
          onClick: (): void => setDialogOpen(false),
          styles: { position: 'absolute', right: '10px', top: '10px' },
        }}
      />
      <LoadingDialog
        status={status}
        errorMessage={error?.message}
        onConfirm={(): void => setStatus(Status.None)}
      />
    </>
  );
};

export default FeedbackDialog;
