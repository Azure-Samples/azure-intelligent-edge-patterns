import React, { memo, FC, useState } from 'react';
import { Dialog } from '@fluentui/react-northstar';

import LabelingPage from '../pages/LabelingPage';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';

interface LabelingPageDialogProps {
  trigger: JSX.Element;
  imageIndex: number;
  partId?: number;
  isRelabel: boolean;
}
const LabelingPageDialog: FC<LabelingPageDialogProps> = ({ trigger, imageIndex, partId, isRelabel }): JSX.Element => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      trigger={trigger}
      styles={{ width: '80%' }}
      open={open}
      onOpen={(): void => setOpen(true)}
      content={
        <LabelingPage
          closeDialog={(): void => setOpen(false)}
          labelingType={LabelingType.SingleAnnotation}
          imageIndex={imageIndex}
          partId={partId}
          isRelabel={isRelabel}
        />
      }
    />
  );
};

export default memo(LabelingPageDialog);
