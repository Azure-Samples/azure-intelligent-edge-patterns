import React, { FC, useState, CSSProperties } from 'react';
import { Flex, Text, Button, Dialog } from '@fluentui/react-northstar';

/**
 * @param trigger Trigger Button
 * @param primaryStyles CSS style of Confirm Button
 */
interface FluentUIStylesProperties extends CSSProperties {
  [':hover']: any;
  [':active']: any;
}

interface ConfirmDialogProps {
  trigger: JSX.Element;
  onConfirm: () => void;
  primaryStyles: FluentUIStylesProperties;
  content: string;
}
const ConfirmDialog: FC<ConfirmDialogProps> = ({ trigger, onConfirm, primaryStyles, content }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Dialog
      trigger={trigger}
      styles={{ width: '20em', padding: '0.5em' }}
      open={open}
      onOpen={(): void => setOpen(true)}
      footer={
        <Flex column gap="gap.large">
          <Text size="large" align="center">
            {content}
          </Text>
          <Flex space="around">
            <Button primary content="Confirm" styles={primaryStyles} onClick={onConfirm} />
            <Button content="Cancel" onClick={(): void => setOpen(false)} />
          </Flex>
        </Flex>
      }
    />
  );
};

export default ConfirmDialog;
