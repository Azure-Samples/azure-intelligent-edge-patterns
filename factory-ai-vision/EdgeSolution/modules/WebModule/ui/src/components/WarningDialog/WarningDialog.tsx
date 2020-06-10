import React from 'react';
import { Dialog, Flex, ExclamationCircleIcon } from '@fluentui/react-northstar';
import { WarningDialogProps } from './WarningDialog.type';

export const WarningDialog: React.FC<WarningDialogProps> = ({
  onConfirm = null,
  onCancel = null,
  trigger,
  contentText,
  cancelButton = 'Cancel',
  confirmButton = 'Confirm',
  open = undefined,
}): JSX.Element => {
  return (
    <Dialog
      styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      cancelButton={cancelButton}
      confirmButton={confirmButton}
      onConfirm={onConfirm}
      onCancel={onCancel}
      open={open}
      content={
        <>
          <Flex hAlign="center" column>
            <ExclamationCircleIcon
              size="largest"
              styles={({ theme: { siteVariables } }): any => ({
                color: siteVariables.colorScheme.brand.foreground,
              })}
            />
            <div>{contentText}</div>
          </Flex>
        </>
      }
      trigger={trigger}
    />
  );
};
