import React, { memo, FC, useState, useEffect, Dispatch } from 'react';

import LabelingPage from '../pages/LabelingPage';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';
import { LabelImage } from '../store/image/imageTypes';
import { RelabelImage } from './ManualIdentification/types';
import { Dialog } from './Dialog';

interface LabelingPageDialogProps {
  trigger: JSX.Element;
  imageIndex: number;
  images: LabelImage[] | RelabelImage[];
  isRelabel: boolean;
  forceOpen?: boolean;
  setForceOpen?: Dispatch<boolean>;
}
const LabelingPageDialog: FC<LabelingPageDialogProps> = ({
  trigger,
  images,
  imageIndex,
  forceOpen,
  setForceOpen,
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(forceOpen);
  }, [forceOpen]);

  return (
    <Dialog
      trigger={trigger}
      styles={{ width: '80%' }}
      open={open}
      onOpen={(): void => setOpen(true)}
      content={
        <LabelingPage
          closeDialog={(): void => {
            if (setForceOpen) setForceOpen(false);
            setOpen(false);
          }}
          labelingType={LabelingType.SingleAnnotation}
          images={images}
          imageIndex={imageIndex}
        />
      }
    />
  );
};

export default memo(LabelingPageDialog);
