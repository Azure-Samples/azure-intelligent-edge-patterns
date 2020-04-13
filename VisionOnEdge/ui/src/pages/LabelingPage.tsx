import React, { useState, FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Flex, Button, Text } from '@fluentui/react-northstar';

import Scene from '../components/LabelingPage/Scene';
import { LabelingType, Annotation, AnnotationState } from '../store/labelingPage/labelingPageTypes';
import { State } from '../store/State';
import { LabelImage } from '../store/part/partTypes';
import { saveAnnotation, updateAnnotation } from '../store/labelingPage/labelingPageActions';

interface LabelingPageProps {
  labelingType: LabelingType;
  imageIndex: number;
  closeDialog: () => void;
}
const LabelingPage: FC<LabelingPageProps> = ({ labelingType, imageIndex, closeDialog }) => {
  const { images, annotations } = useSelector<State, { images: LabelImage[]; annotations: Annotation[] }>(
    (state) => ({
      images: state.part.capturedImages,
      annotations: state.labelingPageState.annotations,
    }),
  );

  const imageUrls = images.map((e) => e.image);
  const dispatch = useDispatch();
  const [fetchedAnno, setFetchedAnno] = useState<any>(null);

  useEffect(() => {
    fetch('/api/annotations/')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const anno = data.find((e) => e.id === images[imageIndex].id).labels;
        if (anno) setFetchedAnno(JSON.parse(anno));
        return void 0;
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  useEffect(() => {
    if (fetchedAnno !== null) {
      dispatch(
        updateAnnotation(0, {
          label: fetchedAnno[0],
          attribute: '',
          annotationState: AnnotationState.Finish,
        }),
      );
    }
  }, [fetchedAnno, dispatch]);

  return (
    <Flex column hAlign="center">
      <Text size="larger" weight="semibold">
        DRAW A RECTANGLE AROUND THE PART
      </Text>
      <Scene url={imageUrls[imageIndex]} labelingType={labelingType} />
      <Flex gap="gap.medium">
        <Flex gap="gap.medium">
          <Button
            primary
            content="Save"
            onClick={(): void => {
              const savedImage = images[imageIndex];
              savedImage.labels = annotations.map((e) => e.label);
              console.log('Save');
              dispatch(saveAnnotation(images[imageIndex], annotations));
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
    </Flex>
  );
};

export default LabelingPage;
