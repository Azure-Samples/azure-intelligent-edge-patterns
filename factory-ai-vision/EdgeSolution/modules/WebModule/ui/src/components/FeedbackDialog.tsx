import React from 'react';
import { Text, RadioGroup, ComponentSlotStyle, Flex } from '@fluentui/react-northstar';
import { Dialog } from './Dialog';

const radioGroupItemStyles: ComponentSlotStyle = {
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'start',
  padding: 0,
};

const FeedbackDialog: React.FC<{ trigger: JSX.Element }> = ({ trigger }) => {
  return (
    <Dialog
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
              items={[
                {
                  name: 'rate',
                  key: 0,
                  label: '1',
                  value: 0,
                  styles: radioGroupItemStyles,
                },
                {
                  name: 'rate',
                  key: 1,
                  label: '2',
                  value: 1,
                  styles: radioGroupItemStyles,
                },
                {
                  name: 'rate',
                  key: 2,
                  label: '3',
                  value: 2,
                  styles: radioGroupItemStyles,
                },
                {
                  name: 'rate',
                  key: 3,
                  label: '4',
                  value: 3,
                  styles: radioGroupItemStyles,
                },
                {
                  name: 'rate',
                  key: 4,
                  label: '5',
                  value: 4,
                  styles: radioGroupItemStyles,
                },
              ]}
            />
            <Text weight="bold">Great</Text>
          </Flex>
        </Flex>
      }
      cancelButton={{ content: 'OK', primary: true }}
      confirmButton={{
        content: 'Help us improve',
        onClick: (): void => {
          window.open('https://github.com/Azure-Samples/azure-intelligent-edge-patterns/issues');
        },
      }}
      trigger={trigger}
    />
  );
};

export default FeedbackDialog;
