import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text, ChevronStartIcon, ChevronEndIcon } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/image/imageTypes';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import { saveLabelImageAnnotation } from '../store/image/imageActions';
import { getFilteredImages } from '../util/getFilteredImages';

interface LabelingPageProps {
  labelingType: LabelingType;
  imageIndex: number;
  closeDialog: () => void;
  partId?: number;
  isRelabel: boolean;
}
const LabelingPage: FC<LabelingPageProps> = ({
  labelingType,
  imageIndex,
  closeDialog,
  partId,
  isRelabel,
}) => {
  const dispatch = useDispatch();
  const [index, setIndex] = useState<number>(imageIndex);
  const { images, annotations } = useSelector<State, { images: LabelImage[]; annotations: Annotation[] }>(
    (state) => ({
      images: state.images,
      annotations: state.labelingPageState.annotations,
    }),
  );
  const filteredImages = getFilteredImages(images, { partId, isRelabel });
  const imageUrl = filteredImages[index]?.image;
  const imageId = filteredImages[index]?.id;

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
      <Flex vAlign="center">
        {!isRelabel && (
          <Button
            text
            disabled={index === 0}
            icon={<ChevronStartIcon size="larger" />}
            onClick={(): void => {
              dispatch(saveLabelImageAnnotation(filteredImages[index].id, annotations));
              setIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
            }}
          />
        )}
        <Scene url={imageUrl ?? '/icons/Play.png'} annotations={annotations} labelingType={labelingType} />
        {!isRelabel && (
          <Button
            text
            disabled={index === filteredImages.length - 1}
            icon={<ChevronEndIcon size="larger" />}
            onClick={(): void => {
              dispatch(saveLabelImageAnnotation(filteredImages[index].id, annotations));
              setIndex((prev) => (prev + 1) % filteredImages.length);
            }}
          />
        )}
      </Flex>
      <Flex gap="gap.medium">
        <Button
          primary
          content="Save"
          onClick={(): void => {
            dispatch(saveLabelImageAnnotation(filteredImages[index].id, annotations));
            closeDialog();
          }}
        />
        <Button
          content="Cancel"
          onClick={(): void => {
            closeDialog();
          }}
        />
      </Flex>
    </Flex>
  );
};

export default LabelingPage;
