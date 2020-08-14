import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation, WorkState } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/image/imageTypes';
import { getAnnotations, resetAnnotation } from '../store/labelingPage/labelingPageActions';
import { saveLabelImageAnnotation, deleteLabelImage } from '../store/image/imageActions';
import PrevNextButton from '../components/LabelingPage/PrevNextButton';
import { Button } from '../components/Button';

interface LabelingPageProps {
  labelingType: LabelingType;
  images: LabelImage[];
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
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);

  const annotations = useSelector<State, Annotation[]>((state) => state.labelingPageState.annotations);

  const isOnePointBox = checkOnePointBox(annotations);
  const imageUrl = images[index]?.image;
  const imageId = images[index]?.id;
  const [loading, setLoading] = useState(false);

  const onSave = async (isRelabelDone: boolean): Promise<void> => {
    setLoading(true);
    await dispatch(saveLabelImageAnnotation(images[index].id, isRelabel, isRelabelDone));
    setLoading(false);
  };

  const onSaveBtnClick = (): void => {
    onSave(false);
    if (index === images.length - 1) closeDialog();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const onDoneBtnClick = (): void => {
    // eslint-disable-next-line no-restricted-globals
    const isRelabelDone = confirm('The Rest of the image will be removed');
    onSave(isRelabelDone);
    if (isRelabelDone) closeDialog();
  };

  const onBoxCreated = (): void => {
    if (index === images.length - 1) onSaveBtnClick();
  };

  const onDeleteImage = async (): Promise<void> => {
    setLoading(true);
    try {
      await dispatch(deleteLabelImage(images[index].id));
      if (index === images.length - 1) setIndex(index - 1);
      if (images.length === 1) closeDialog();
    } catch (e) {
      alert(e);
    }
    setLoading(false);
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
        prevDisabled={index === 0 || workState === WorkState.Creating || isOnePointBox || loading}
        nextDisabled={
          index === images.length - 1 || workState === WorkState.Creating || isOnePointBox || loading
        }
        onPrevClick={(): void => {
          onSave(false);
          setIndex((prev) => (prev - 1 + images.length) % images.length);
        }}
        onNextClick={(): void => {
          onSave(false);
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
          loading={loading}
        />
        {isRelabel ? (
          <Button primary content="Done" onClick={onDoneBtnClick} loading={loading} />
        ) : (
          <Button
            primary
            loading={loading}
            content="Cancel"
            onClick={(): void => {
              closeDialog();
            }}
          />
        )}
        <Button primary content="Delete Image" onClick={onDeleteImage} loading={loading} />
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
