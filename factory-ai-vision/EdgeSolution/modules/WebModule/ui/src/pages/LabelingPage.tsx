import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation, WorkState } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/image/imageTypes';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import { saveLabelImageAnnotation, deleteLabelImage } from '../store/image/imageActions';
import { RelabelImage } from '../components/ManualIdentification/types';
import PrevNextButton from '../components/LabelingPage/PrevNextButton';

interface LabelingPageProps {
  labelingType: LabelingType;
  images: LabelImage[] | RelabelImage[];
  imageIndex: number;
  closeDialog: () => void;
}
const LabelingPage: FC<LabelingPageProps> = ({ labelingType, images, imageIndex, closeDialog }) => {
  const dispatch = useDispatch();
  const [index, setIndex] = useState<number>(imageIndex);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);

  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);

  const isOnePointBox = checkOnePointBox(annotations);
  const imageUrl = images[index]?.image;
  const imageId = images[index]?.id;

  const onSave = (): void => {
    dispatch(saveLabelImageAnnotation(images[index].id, annotations));
    if (index === images.length - 1) closeDialog();
    setIndex((prev) => (prev + 1) % images.length);
  };
  const onBoxCreated = (): void => {
    if (index === images.length - 1) onSave();
  };

  const onDeleteImage = (): void => {
    dispatch(deleteLabelImage(images[imageIndex].id));
  };

  useEffect(() => {
    if (typeof imageId === 'number') dispatch(getAnnotations(imageId));
    return (): void => {
      dispatch(resetAnnotation());
    };
  }, [dispatch, imageId]);

  return (
    <Flex column hAlign="center">
      <Text size="larger" weight="semibold">
        DRAW A RECTANGLE AROUND THE PART
      </Text>
      <Text size="larger" styles={{ alignSelf: 'flex-start' }}>
        {index + 1}
      </Text>
      <PrevNextButton
        prevDisabled={index === 0 || workState === WorkState.Creating || isOnePointBox}
        nextDisabled={index === images.length - 1 || workState === WorkState.Creating || isOnePointBox}
        onPrevClick={(): void => {
          dispatch(saveLabelImageAnnotation(images[index].id, annotations));
          setIndex((prev) => (prev - 1 + images.length) % images.length);
        }}
        onNextClick={(): void => {
          dispatch(saveLabelImageAnnotation(images[index].id, annotations));
          setIndex((prev) => (prev + 1) % images.length);
        }}
      >
        <Scene
          url={imageUrl ?? '/icons/Play.png'}
          annotations={annotations}
          partName={images[index]?.part.name}
          workState={workState}
          setWorkState={setWorkState}
          labelingType={labelingType}
          onBoxCreated={onBoxCreated}
        />
      </PrevNextButton>
      <Flex gap="gap.medium">
        <Button
          primary
          content={index === images.length - 1 ? 'Save and Done' : 'Save and Next'}
          disabled={isOnePointBox || workState === WorkState.Creating}
          onClick={onSave}
        />
        <Button
          primary
          content="Cancel"
          onClick={(): void => {
            closeDialog();
          }}
        />
        <Button primary content="Delete Image" onClick={onDeleteImage} />
      </Flex>
    </Flex>
  );
};

const checkOnePointBox = (annotations: Annotation[]): boolean => {
  if (annotations.length === 0) return false;
  const { label } = annotations[annotations.length - 1];
  return label.x1 === label.x2 && label.y1 === label.y2;
};

export default LabelingPage;
