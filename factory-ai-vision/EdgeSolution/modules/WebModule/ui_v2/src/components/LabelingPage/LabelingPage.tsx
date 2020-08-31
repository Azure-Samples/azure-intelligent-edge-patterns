import React, { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
  Dialog,
  Button,
  DialogFooter,
  Stack,
  Text,
  Separator,
  mergeStyleSets,
  IDialogContentProps,
  IModalProps,
} from '@fluentui/react';
import * as R from 'ramda';

import { State } from 'RootStateType';
import { LabelingType, WorkState } from './type';
import { closeLabelingPage, goPrevImage, goNextImage } from '../../store/labelingPageSlice';
import { selectImageEntities, saveLabelImageAnnotation } from '../../store/imageSlice';
import { labelPageAnnoSelector } from '../../store/annotationSlice';
import { Annotation } from '../../store/type';
import { selectPartEntities, Part } from '../../store/partSlice';
import { deleteImage } from '../../store/actions';
import Scene from './Scene';
import { PartPicker } from './PartPicker';

const getSelectedImageId = (state: State) => state.labelingPage.selectedImageId;
export const imageSelector = createSelector(
  [getSelectedImageId, selectImageEntities],
  (selectedImageId, imageEntities) => imageEntities[selectedImageId],
);
const imagePartSelector = createSelector([imageSelector, selectPartEntities], (img, partEntities) => {
  if (img) return partEntities[img.part];
  return { id: null, name: '', description: '' };
});

const selectImageTimeStamp = (state: State) => {
  const timeStampString = imageSelector(state)?.timestamp || '';
  // Format example: AUG 31, 2020, 1:54 PM
  return new Date(Date.parse(timeStampString))
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    })
    .toUpperCase();
};

const dialogContentProps: IDialogContentProps = {
  title: 'Image detail',
  subText: 'Drag a box around the object you want to tag',
  styles: { content: { width: '1080px' } },
};

const modalProps: IModalProps = {
  isBlocking: true,
  layerProps: {
    eventBubblingEnabled: true,
  },
};

const labelingPageStyle = mergeStyleSets({
  imgContainer: { position: 'relative', width: '70%', height: '540px', backgroundColor: '#F3F2F1' },
  imgInfoContainer: { width: '30%' },
});

interface LabelingPageProps {
  labelingType?: LabelingType;
  isRelabel: boolean;
}

const LabelingPage: FC<LabelingPageProps> = ({ labelingType = LabelingType.SingleAnnotation, isRelabel }) => {
  const dispatch = useDispatch();
  const imageIds = useSelector<State, number[]>((state) => state.labelingPage.imageIds);
  const selectedImageId = useSelector<State, number>((state) => state.labelingPage.selectedImageId);
  const index = imageIds.findIndex((e) => e === selectedImageId);
  const imageUrl = useSelector<State, string>((state) => imageSelector(state)?.image || '');
  const imageConfidenceLevel = useSelector<State, number>((state) => imageSelector(state)?.confidence || 0);
  const imageTimeStamp = useSelector<State, string>(selectImageTimeStamp);
  const imgPart = useSelector<State, Part>(imagePartSelector);
  const closeDialog = () => dispatch(closeLabelingPage());
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [loading, setLoading] = useState(false);

  const annotations = useSelector<State, Annotation[]>(labelPageAnnoSelector);
  const noChanged = useSelector<State, boolean>((state) =>
    R.equals(state.annotations.entities, state.annotations.originEntities),
  );

  const isOnePointBox = checkOnePointBox(annotations);

  const onSave = async (isRelabelDone: boolean) => {
    setLoading(true);
    await dispatch(saveLabelImageAnnotation({ isRelabel, isRelabelDone }));
    setLoading(false);
  };

  const onSaveBtnClick = async () => {
    await onSave(false);
    dispatch(goNextImage());
    if (index === imageIds.length - 1) closeDialog();
  };

  const onDoneBtnClick = (): void => {
    // eslint-disable-next-line no-restricted-globals
    const isRelabelDone = confirm('The Rest of the image will be removed');
    onSave(isRelabelDone);
    if (isRelabelDone) closeDialog();
  };

  const onBoxCreated = (): void => {
    // TODO Check if we need to trigger save and click for last image
    // if (index === imageIds.length - 1) onSaveBtnClick();
  };

  const onDeleteImage = async () => {
    setLoading(true);
    await dispatch(deleteImage(selectedImageId));
    setLoading(false);
  };

  const onRenderImage = (): JSX.Element => (
    <>
      <Scene
        url={imageUrl}
        annotations={annotations}
        workState={workState}
        setWorkState={setWorkState}
        labelingType={labelingType}
        onBoxCreated={onBoxCreated}
        imgPart={imgPart}
      />
      <Text variant="small" styles={{ root: { position: 'absolute', right: 5, bottom: 5 } }}>
        {imageTimeStamp}
      </Text>
    </>
  );

  const onRenderPrediction = (): JSX.Element => {
    if (!isRelabel) return null;
    return (
      <>
        <Stack>
          <Text styles={{ root: { fontWeight: 'bold' } }}>Predictions</Text>
          <Text>
            This object was identified as a <b>{imgPart?.name}</b> with{' '}
            <b>{(imageConfidenceLevel * 100).toFixed(2)}% confidence</b>.
          </Text>
        </Stack>
        <Separator styles={{ root: { width: 70, alignSelf: 'center' } }} />
      </>
    );
  };

  const onRenderInfoOnRight = (): JSX.Element => (
    <>
      {onRenderPrediction()}
      <PartPicker selectedPart={imgPart?.id} />
    </>
  );

  return (
    <Dialog
      dialogContentProps={dialogContentProps}
      hidden={selectedImageId === null}
      onDismiss={closeDialog}
      modalProps={modalProps}
      // Remove the default max-width
      maxWidth={9999}
    >
      <Stack horizontal tokens={{ childrenGap: '24px' }}>
        <Stack verticalAlign="center" className={labelingPageStyle.imgContainer}>
          {onRenderImage()}
        </Stack>
        <Stack tokens={{ childrenGap: 20 }} className={labelingPageStyle.imgInfoContainer}>
          {onRenderInfoOnRight()}
        </Stack>
      </Stack>
      <DialogFooter>
        <Button
          primary
          text={index === imageIds.length - 1 ? 'Save and Done' : 'Save and Next'}
          disabled={isOnePointBox || workState === WorkState.Creating || loading || noChanged}
          onClick={onSaveBtnClick}
        />
        <Button text="Delete Image" onClick={onDeleteImage} disabled={loading} />
        {isRelabel ? (
          <Button text="Done" onClick={onDoneBtnClick} disabled={loading} />
        ) : (
          <Button
            text="Close"
            onClick={(): void => {
              closeDialog();
            }}
            disabled={loading}
          />
        )}
      </DialogFooter>
    </Dialog>
  );
};

const checkOnePointBox = (annotations: Annotation[]): boolean => {
  if (annotations.length === 0) return false;
  const { label } = annotations[annotations.length - 1];
  return label.x1 === label.x2 && label.y1 === label.y2;
};

export default LabelingPage;
