import React, { useState } from 'react';
import {
  Text,
  RadioGroup,
  ComponentSlotStyle,
  Flex,
  ShorthandCollection,
  RadioGroupItemProps,
  CloseIcon,
} from '@fluentui/react-northstar';
import Axios from 'axios';

import { Dialog } from './Dialog';
import { LoadingDialog, Status } from './LoadingDialog/LoadingDialog';
import { handleAxiosError } from '../util/handleAxiosError';

const radioGroupItemStyles: ComponentSlotStyle = {
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'start',
  padding: 0,
};

enum Feedback {
  VeryBad = 'VB',
  Poor = 'PR',
  Fair = 'FR',
  Good = 'GD',
  Excellent = 'EX',
}

const feedbackItems: ShorthandCollection<RadioGroupItemProps> = [
  {
    name: 'rate',
    key: 0,
    label: '1',
    value: Feedback.VeryBad,
    styles: radioGroupItemStyles,
  },
  {
    name: 'rate',
    key: 1,
    label: '2',
    value: Feedback.Poor,
    styles: radioGroupItemStyles,
  },
  {
    name: 'rate',
    key: 2,
    label: '3',
    value: Feedback.Fair,
    styles: radioGroupItemStyles,
  },
  {
    name: 'rate',
    key: 3,
    label: '4',
    value: Feedback.Good,
    styles: radioGroupItemStyles,
  },
  {
    name: 'rate',
    key: 4,
    label: '5',
    value: Feedback.Excellent,
    styles: radioGroupItemStyles,
  },
];

const FeedbackDialog: React.FC<{ trigger: JSX.Element }> = ({ trigger }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [satisfaction, setSatisfaction] = useState<Feedback>(null);
  const [status, setStatus] = useState<Status>(Status.None);
  const [error, setError] = useState<Error>(null);

  const onUpdate = async (): Promise<void> => {
    setStatus(Status.Loading);
    try {
      await Axios.post('/api/feedback', { satisfaction });
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
        styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        header="Your Feedback is greatly Appreciated!"
        content={
          <Flex column hAlign="center" gap="gap.medium">
            <Text size="large">Rate your experience</Text>
            <Flex vAlign="end">
              <Text weight="bold" styles={{ marginRight: '0.75rem' }}>
                Poor
              </Text>
              <RadioGroup
                styles={{ display: 'flex', flexDirection: 'row', margin: 0 }}
                onCheckedValueChange={(_, { value }): void => {
                  setSatisfaction(value as Feedback);
                }}
                items={feedbackItems}
              />
              <Text weight="bold">Great</Text>
            </Flex>
          </Flex>
        }
        cancelButton={{ content: 'OK', primary: true, disabled: satisfaction === null, onClick: onUpdate }}
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
