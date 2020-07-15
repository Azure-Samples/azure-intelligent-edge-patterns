import React, { FC, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation, WorkState } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/image/imageTypes';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import {
  saveLabelImageAnnotation,
  deleteLabelImage,
  removeImagesFromPart,
} from '../store/image/imageActions';
import { RelabelImage, JudgedImageList } from '../components/ManualIdentification/types';
import PrevNextButton from '../components/LabelingPage/PrevNextButton';

interface LabelingPageProps {
  labelingType: LabelingType;
  images: LabelImage[] | RelabelImage[];
  imageIndex: number;
  closeDialog: () => void;
  setJudgedImageList?: Dispatch<SetStateAction<JudgedImageList>>;
  isRelabel: boolean;
}
const LabelingPage: FC<LabelingPageProps> = ({
  labelingType,
  images,
  imageIndex,
  closeDialog,
  setJudgedImageList,
  isRelabel,
}) => {
  const dispatch = useDispatch();
  const [index, setIndex] = useState<number>(imageIndex);
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);

  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);

  const isOnePointBox = checkOnePointBox(annotations);
  const imageUrl = images[index]?.image;
  const imageId = images[index]?.id;

  const onSave = (): void => {
    dispatch(saveLabelImageAnnotation(images[index].id));
    if (setJudgedImageList)
      setJudgedImageList((prev) => [...prev, { partId: annotations[0].part.id, imageId: images[index].id }]);
  };

  const onSaveBtnClick = (): void => {
    onSave();
    if (index === images.length - 1) closeDialog();
    setIndex((prev) => (prev + 1) % images.length);
  };
  const onBoxCreated = (): void => {
    if (index === images.length - 1) onSaveBtnClick();
  };

  const onDeleteImage = (): void => {
    dispatch(deleteLabelImage(images[index].id));
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
          onSave();
          setIndex((prev) => (prev - 1 + images.length) % images.length);
        }}
        onNextClick={(): void => {
          onSave();
          setIndex((prev) => (prev + 1) % images.length);
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
          content={index === images.length - 1 ? 'Save and Done' : 'Save and Next'}
          disabled={isOnePointBox || workState === WorkState.Creating}
          onClick={onSaveBtnClick}
        />
        {isRelabel ? (
          <Button
            primary
            content="Done"
            onClick={(): void => {
              onSave();
              // eslint-disable-next-line no-restricted-globals
              const finishLabel = confirm('The Rest of the image will be removed');
              if (finishLabel) {
                setJudgedImageList((prev) => {
                  const notInJudged = (imgId: number): boolean => !prev.find((e) => e.imageId === imgId);
                  const imageIdsNotInJudge = images.filter((image) => notInJudged(image.id)).map((e) => e.id);
                  dispatch(removeImagesFromPart(imageIdsNotInJudge));
                  return [...prev, ...imageIdsNotInJudge.map((e) => ({ imageId: e, partId: null }))];
                });
                closeDialog();
              }
            }}
          />
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
  );
};

const checkOnePointBox = (annotations: Annotation[]): boolean => {
  if (annotations.length === 0) return false;
  const { label } = annotations[annotations.length - 1];
  return label.x1 === label.x2 && label.y1 === label.y2;
};

export default LabelingPage;
