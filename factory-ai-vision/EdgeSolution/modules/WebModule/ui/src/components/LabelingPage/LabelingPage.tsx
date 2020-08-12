import React, { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Flex, Text, Dialog } from '@fluentui/react-northstar';

import Scene from './Scene';
import { LabelingType, WorkState } from './type';
import { State } from '../../store/State';
import PrevNextButton from './PrevNextButton';
import { closeLabelingPage, goPrevImage, goNextImage } from '../../features/labelingPageSlice';
import { selectImageEntities, saveLabelImageAnnotation } from '../../features/imageSlice';
import { labelPageAnnoSelector } from '../../features/annotationSlice';
import { Annotation } from '../../features/type';
import { selectPartEntities, Part } from '../../features/partSlice';
import { deleteImage } from '../../features/actions';
import { Button } from '../Button';

const getSelectedImageId = (state: State) => state.labelingPage.selectedImageId;
export const imageSelector = createSelector(
  [getSelectedImageId, selectImageEntities],
  (selectedImageId, imageEntities) => imageEntities[selectedImageId],
);
const imagePartSelector = createSelector([imageSelector, selectPartEntities], (img, partEntities) => {
  if (img) return partEntities[img.part];
  return { id: null, name: '', description: '' };
});

interface LabelingPageProps {
  labelingType: LabelingType;
  isRelabel: boolean;
}

const LabelingPage: FC<LabelingPageProps> = ({ labelingType, isRelabel }) => {
  const dispatch = useDispatch();
  const imageIds = useSelector<State, number[]>((state) => state.labelingPage.imageIds);
  const selectedImageId = useSelector<State, number>((state) => state.labelingPage.selectedImageId);
  const index = imageIds.findIndex((e) => e === selectedImageId);
  const imageUrl = useSelector<State, string>((state) => imageSelector(state)?.image || '');
  const imgPart = useSelector<State, Part>(imagePartSelector);
  const closeDialog = () => dispatch(closeLabelingPage());
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [loading, setLoading] = useState(false);

  const annotations = useSelector<State, Annotation[]>(labelPageAnnoSelector);

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
    if (index === imageIds.length - 1) onSaveBtnClick();
  };

  const onDeleteImage = async () => {
    setLoading(true);
    await dispatch(deleteImage(selectedImageId));
    setLoading(false);
  };

  return (
    <LabelingPageDialog open={selectedImageId !== null}>
      <Flex column hAlign="center">
        <Text size="larger" weight="semibold">
          DRAW A RECTANGLE AROUND THE PART
        </Text>
        <Text size="larger" styles={{ alignSelf: 'flex-start' }}>
          {index + 1}
        </Text>
        <PrevNextButton
          prevDisabled={index === 0 || workState === WorkState.Creating || isOnePointBox || loading}
          nextDisabled={
            index === imageIds.length - 1 || workState === WorkState.Creating || isOnePointBox || loading
          }
          onPrevClick={(): void => {
            onSave(false);
            dispatch(goPrevImage());
          }}
          onNextClick={(): void => {
            onSave(false);
            dispatch(goNextImage());
          }}
        >
          <Scene
            url={imageUrl}
            annotations={annotations}
            workState={workState}
            setWorkState={setWorkState}
            labelingType={labelingType}
            onBoxCreated={onBoxCreated}
            partFormDisabled={!isRelabel}
            imgPart={imgPart}
          />
        </PrevNextButton>
        <Flex gap="gap.medium">
          <Button
            primary
            content={index === imageIds.length - 1 ? 'Save and Done' : 'Save and Next'}
            disabled={isOnePointBox || workState === WorkState.Creating}
            onClick={onSaveBtnClick}
            loading={loading}
          />
          {isRelabel ? (
            <Button primary content="Done" onClick={onDoneBtnClick} loading={loading} />
          ) : (
            <Button
              primary
              content="Cancel"
              onClick={(): void => {
                closeDialog();
              }}
              loading={loading}
            />
          )}
          <Button primary content="Delete Image" onClick={onDeleteImage} loading={loading} />
        </Flex>
      </Flex>
    </LabelingPageDialog>
  );
};

const LabelingPageDialog: React.FC<{ open: boolean }> = ({ children, open }) => (
  <Dialog styles={{ width: '80%' }} open={open} content={children} />
);

const checkOnePointBox = (annotations: Annotation[]): boolean => {
  if (annotations.length === 0) return false;
  const { label } = annotations[annotations.length - 1];
  return label.x1 === label.x2 && label.y1 === label.y2;
};

export default LabelingPage;
