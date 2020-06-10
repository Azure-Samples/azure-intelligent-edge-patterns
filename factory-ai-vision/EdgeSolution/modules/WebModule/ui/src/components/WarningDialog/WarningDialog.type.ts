export type WarningDialogProps = {
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger: JSX.Element;
  contentText: JSX.Element;
  cancelButton?: string;
  confirmButton?: string;
};
