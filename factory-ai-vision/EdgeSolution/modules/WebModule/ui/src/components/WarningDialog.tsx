import React, { useState } from 'react';
import { Dialog, DialogFooter, PrimaryButton, Stack, DefaultButton } from '@fluentui/react';
import { InfoIcon } from '@fluentui/react-icons';

type WarningDialogProps = {
  contentText: JSX.Element;
  trigger?: JSX.Element;
  open?: boolean;
  confirmButton?: string;
  cancelButton?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const WarningDialog: React.FC<WarningDialogProps> = ({
  contentText,
  trigger,
  open,
  confirmButton = 'Confirm',
  cancelButton = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const [isOpen, setisOpen] = useState(false);
  const openDialog = () => setisOpen(true);
  const closeDialog = () => setisOpen(false);

  const onConfirmClick = () => {
    if (onConfirm) onConfirm();
    closeDialog();
  };

  const onCancelClick = () => {
    if (onCancel) onCancel();
    closeDialog();
  };

  return (
    <>
      <Dialog hidden={!(open === undefined ? isOpen : open)} maxWidth={800}>
        <Stack horizontalAlign="center">
          <InfoIcon style={{ fontSize: 50, margin: 10 }} />
          {contentText}
        </Stack>
        <DialogFooter>
          <Stack tokens={{ childrenGap: 10 }} horizontalAlign="center" horizontal>
            <PrimaryButton text={confirmButton} onClick={onConfirmClick} />
            <DefaultButton text={cancelButton} onClick={onCancelClick} />
          </Stack>
        </DialogFooter>
      </Dialog>
      <div
        onClick={(e) => {
          if (e.target !== e.currentTarget) openDialog();
        }}
      >
        {trigger}
      </div>
    </>
  );
};
