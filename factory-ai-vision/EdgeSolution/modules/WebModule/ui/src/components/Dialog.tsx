import React, { useMemo } from 'react';
import { Dialog as FluentDialog, DialogProps, ShorthandValue, ButtonProps } from '@fluentui/react-northstar';

const isButtonProps = (obj: ShorthandValue<ButtonProps>): obj is ButtonProps =>
  (obj as ButtonProps)?.content !== undefined;

/**
 * Change the order of confirm button and cancel button, according to Microsoft Windows design guideline.
 * https://docs.microsoft.com/en-us/windows/win32/uxguide/win-dialog-box
 */
export const Dialog: React.FC<DialogProps> = (props) => {
  const confirmButton: ShorthandValue<ButtonProps> = useMemo(() => {
    if (typeof props.confirmButton === 'string') return { primary: true, content: props.confirmButton };
    if (isButtonProps(props.confirmButton)) return { ...props.confirmButton, primary: true };
    return props.confirmButton;
  }, [props.confirmButton]);

  const cancelButton: ShorthandValue<ButtonProps> = useMemo(() => {
    if (typeof props.cancelButton === 'string') return { primary: false, content: props.cancelButton };
    if (isButtonProps(props.cancelButton)) return { ...props.cancelButton, primary: false };
    return props.cancelButton;
  }, [props.cancelButton]);

  return (
    <FluentDialog
      {...props}
      // Swap the two button confirm and cancel
      onConfirm={props.onCancel}
      onCancel={props.onConfirm}
      confirmButton={props.cancelButton && cancelButton}
      cancelButton={props.confirmButton && confirmButton}
    >
      {props.children}
    </FluentDialog>
  );
};
