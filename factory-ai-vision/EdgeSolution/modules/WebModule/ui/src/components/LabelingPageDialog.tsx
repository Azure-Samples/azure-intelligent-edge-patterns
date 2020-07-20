import React, { memo, FC, useState, useEffect, Dispatch, SetStateAction } from 'react';

import LabelingPage from '../pages/LabelingPage';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';
import { LabelImage } from '../store/image/imageTypes';
import { RelabelImage, JudgedImageList } from './ManualIdentification/types';
import { Dialog } from './Dialog';

interface LabelingPageDialogProps {
  trigger: JSX.Element;
  imageIndex: number;
  images: LabelImage[] | RelabelImage[];
  isRelabel: boolean;
  forceOpen?: boolean;
  setJudgedImageList?: Dispatch<SetStateAction<JudgedImageList>>;
}
const LabelingPageDialog: FC<LabelingPageDialogProps> = ({
  trigger,
  images,
  imageIndex,
  forceOpen = false,
  setJudgedImageList,
  isRelabel,
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
          closeDialog={(): void => setOpen(false)}
          labelingType={LabelingType.SingleAnnotation}
          images={images}
          imageIndex={imageIndex}
          setJudgedImageList={setJudgedImageList}
          isRelabel={isRelabel}
        />
      }
    />
  );
};

export default memo(LabelingPageDialog);
