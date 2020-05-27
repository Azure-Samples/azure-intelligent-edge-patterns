import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text, ChevronStartIcon, ChevronEndIcon } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/image/imageTypes';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import { saveLabelImageAnnotation } from '../store/image/imageActions';
import { RelabelImage } from '../components/ManualIdentification/types';

interface LabelingPageProps {
  labelingType: LabelingType;
  images: LabelImage[] | RelabelImage[];
  imageIndex: number;
  closeDialog: () => void;
  isRelabel: boolean;
}
const LabelingPage: FC<LabelingPageProps> = ({
  labelingType,
  images,
  imageIndex,
  closeDialog,
  isRelabel,
}) => {
  const dispatch = useDispatch();
  const [index, setIndex] = useState<number>(imageIndex);
  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);

  const imageUrl = images[index]?.image;
  const imageId = images[index]?.id;

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
            disabled={index === 0 || isOnePointBox(annotations)}
            icon={<ChevronStartIcon size="larger" />}
            onClick={(): void => {
              dispatch(saveLabelImageAnnotation(images[index].id, annotations));
              setIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
          />
        )}
        <Scene url={imageUrl ?? '/icons/Play.png'} annotations={annotations} labelingType={labelingType} />
        {!isRelabel && (
          <Button
            text
            disabled={index === images.length - 1 || isOnePointBox(annotations)}
            icon={<ChevronEndIcon size="larger" />}
            onClick={(): void => {
              dispatch(saveLabelImageAnnotation(images[index].id, annotations));
              setIndex((prev) => (prev + 1) % images.length);
            }}
          />
        )}
      </Flex>
      <Flex gap="gap.medium">
        <Button
          primary
          content="Save"
          disabled={isOnePointBox(annotations)}
          onClick={(): void => {
            dispatch(saveLabelImageAnnotation(images[index].id, annotations));
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

const isOnePointBox = (annotations: Annotation[]): boolean => {
  if (annotations.length === 0) return false;
  const { label } = annotations[annotations.length - 1];
  return label.x1 === label.x2 && label.y1 === label.y2;
};

export default LabelingPage;
