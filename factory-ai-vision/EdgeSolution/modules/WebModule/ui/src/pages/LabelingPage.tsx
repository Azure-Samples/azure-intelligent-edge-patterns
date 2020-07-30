import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text, Dialog } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation, WorkState } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import { saveLabelImageAnnotation, deleteLabelImage } from '../store/image/imageActions';
import PrevNextButton from '../components/LabelingPage/PrevNextButton';
import { closeLabelingPage } from '../action/creators/labelingPageActionCreators';

interface LabelingPageProps {
  labelingType: LabelingType;
  isRelabel: boolean;
}

const LabelingPage: FC<LabelingPageProps> = ({ labelingType, isRelabel }) => {
  const dispatch = useDispatch();
  const imageIds = useSelector<State, number[]>((state) => state.labelingPage.imageIds);
  const selectedImageId = useSelector<State, number>((state) => state.labelingPage.selectedImageId);
  const imageUrl = useSelector<State, string>(
    (state) => state.labelImages.entities[state.labelingPage.selectedImageId]?.image,
  );
  const closeDialog = () => dispatch(closeLabelingPage());
  const [index, setIndex] = useState<number>(0);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);

  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);

  const isOnePointBox = checkOnePointBox(annotations);

  const onSave = (isRelabelDone: boolean): void => {
    dispatch(saveLabelImageAnnotation(selectedImageId, isRelabel, isRelabelDone));
  };

  const onSaveBtnClick = (): void => {
    onSave(false);
    // if (index === imageIds.length - 1) closeDialog();
    // setIndex((prev) => (prev + 1) % images.length);
  };

  const onDoneBtnClick = (): void => {
    // eslint-disable-next-line no-restricted-globals
    const isRelabelDone = confirm('The Rest of the image will be removed');
    onSave(isRelabelDone);
    // if (isRelabelDone) closeDialog();
  };

  const onBoxCreated = (): void => {
    if (index === imageIds.length - 1) onSaveBtnClick();
  };

  const onDeleteImage = (): void => {
    dispatch(deleteLabelImage(selectedImageId));
  };

  // useEffect(() => {
  //   if (typeof selectedImageId === 'number') dispatch(getAnnotations(selectedImageId));
  //   return (): void => {
  //     dispatch(resetAnnotation());
  //   };
  // }, [dispatch, selectedImageId]);

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
          prevDisabled={index === 0 || workState === WorkState.Creating || isOnePointBox}
          nextDisabled={index === imageIds.length - 1 || workState === WorkState.Creating || isOnePointBox}
          onPrevClick={(): void => {
            onSave(false);
            setIndex((prev) => (prev - 1 + imageIds.length) % imageIds.length);
          }}
          onNextClick={(): void => {
            onSave(false);
            setIndex((prev) => (prev + 1) % imageIds.length);
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
          />
        </PrevNextButton>
        <Flex gap="gap.medium">
          <Button
            primary
            content={index === imageIds.length - 1 ? 'Save and Done' : 'Save and Next'}
            disabled={isOnePointBox || workState === WorkState.Creating}
            onClick={onSaveBtnClick}
          />
          {isRelabel ? (
            <Button primary content="Done" onClick={onDoneBtnClick} />
          ) : (
            <Button
              primary
              content="Cancel"
              onClick={(): void => {
                closeDialog();
              }}
            />
          )}
          <Button primary content="Delete Image" onClick={onDeleteImage} />
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
