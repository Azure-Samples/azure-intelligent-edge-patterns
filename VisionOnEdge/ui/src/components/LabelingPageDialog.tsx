import React, { memo, FC, useState, Dispatch, useEffect } from 'react';
import { Dialog } from '@fluentui/react-northstar';

import LabelingPage from '../pages/LabelingPage';
import { LabelingType } from '../store/labelingPage/labelingPageTypes';

const LabelingPageDialog: FC<{ trigger: JSX.Element; imageIndex: number }> = ({
  trigger,
  imageIndex,
}): JSX.Element => {
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
        />
      }
    />
  );
};

export default memo(LabelingPageDialog);
