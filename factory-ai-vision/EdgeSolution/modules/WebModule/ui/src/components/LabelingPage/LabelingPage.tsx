import React, { FC, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
  Dialog,
  DialogFooter,
  Stack,
  Text,
  Separator,
  mergeStyleSets,
  IDialogContentProps,
  IModalProps,
  DefaultButton,
  PrimaryButton,
} from '@fluentui/react';

import { State } from 'RootStateType';
import { LabelingType, WorkState } from './type';
import { closeLabelingPage, OpenFrom } from '../../store/labelingPageSlice';
import {
  selectImageEntities,
  saveLabelImageAnnotation,
  selectImageById,
  saveClassificationImageTag,
} from '../../store/imageSlice';
import { createClassification } from '../../store/annotationSlice';
import { labelPageAnnoSelector } from '../../store/annotationSlice';
import { Annotation } from '../../store/type';
import { selectPartEntities, Part, getParts } from '../../store/partSlice';
import { deleteImage, thunkGoNextImage, thunkGoPrevImage } from '../../store/actions';
import { PartPicker } from './PartPicker';
import { timeStampConverter } from '../../utils/timeStampConverter';
import { dummyFunction } from '../../utils/dummyFunction';
import { selectProjectPartsFactory } from '../../store/selectors';
import { selectTrainingProjectById } from '../../store/trainingProjectSlice';

import Scene from './Scene';

const getSelectedImageId = (state: State) => state.labelingPage.selectedImageId;
export const imageSelector = createSelector(
  [getSelectedImageId, selectImageEntities],
  (selectedImageId, imageEntities) => imageEntities[selectedImageId],
);
const imagePartSelector = createSelector([imageSelector, selectPartEntities], (img, partEntities) => {
  if (img) return partEntities[img.part];
  return {
    id: null,
    name: '',
    description: '',
    trainingProject: null,
    local_image_count: 0,
    remote_image_count: 0,
  };
});

const selectImageTimeStamp = (state: State) => {
  const timeStampString = imageSelector(state)?.timestamp || '';
  return timeStampConverter(timeStampString);
};

const modalProps: IModalProps = {
  isBlocking: true,
  layerProps: {
    eventBubblingEnabled: true,
  },
};

const labelingPageStyle = mergeStyleSets({
  imgContainer: { position: 'relative', width: '70%', height: '540px', backgroundColor: '#F3F2F1' },
  imgCover: {
    position: 'absolute',
    height: '540px',
    width: '100%',
    zIndex: 2,
    cursor: 'not-allowed',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    fontSize: '80px',
    fontWeight: 600,
    color: '#FFF',
  },
  covertText: { width: '80%', wordBreak: 'break-all', textAlign: 'center' },
  imgInfoContainer: { width: '30%' },
});

type LabelingPageProps = {
  projectId: number;
  onSaveAndGoCaptured?: () => void;
};

const cameraNameSelector = (state: State) => {
  const cameraId = imageSelector(state)?.camera;
  return state.camera.entities[cameraId]?.name;
};

const getPart = (parts: Part[], selectedPart: number) => parts.find((part) => part.id === selectedPart);

const LabelingPage: FC<LabelingPageProps> = ({ onSaveAndGoCaptured, projectId }) => {
  const dispatch = useDispatch();

  const imageIds = useSelector<State, number[]>((state) => state.labelingPage.imageIds);
  const selectedImageId = useSelector<State, number>((state) => state.labelingPage.selectedImageId);
  const index = imageIds.findIndex((e) => e === selectedImageId);
  const imageUrl = useSelector<State, string>((state) => imageSelector(state)?.image || '');
  const imgIsRelabel = useSelector<State, boolean>((state) => !!imageSelector(state)?.isRelabel);
  const imageConfidenceLevel = useSelector<State, number>((state) => imageSelector(state)?.confidence || 0);
  const imageTimeStamp = useSelector<State, string>(selectImageTimeStamp);
  const imgPart = useSelector<State, Part>(imagePartSelector);
  const cameraName = useSelector(cameraNameSelector);
  const canBackToCapture = useSelector(
    (state: State) => state.labelingPage.openFrom === OpenFrom.CaptureDialog,
  );
  const noPrevAndNext = useSelector((state: State) => state.labelingPage.openFrom === OpenFrom.AfterCapture);
  const imageProjectId = useSelector<State, number>((state) => imageSelector(state)?.project);

  const closeDialog = () => dispatch(closeLabelingPage());
  const [workState, setWorkState] = useState<WorkState>(WorkState.None);
  const [loading, setLoading] = useState(false);

  const project = useSelector((state: State) => selectTrainingProjectById(state, projectId));
  const partOfProjectSelector = useMemo(() => selectProjectPartsFactory(projectId), [projectId]);
  const parts = useSelector(partOfProjectSelector);
  const annotations = useSelector<State, Annotation[]>(labelPageAnnoSelector);
  const { selectedPartId } = useSelector((state: State) => state.labelingPage);
  const image = useSelector((state: State) => selectImageById(state, selectedImageId));

  console.log('selectedPartId', selectedPartId);
  console.log(getPart(parts, selectedPartId));
  console.log('image', image);

  const isOnePointBox = checkOnePointBox(annotations);

  const dialogContentProps: IDialogContentProps = {
    title: 'Image detail',
    subText:
      project.projectType === 'ObjectDetection'
        ? 'Drag a box around the object you want to tag'
        : 'Please add new tag for this image',
    styles: { content: { width: '1080px' } },
  };

  const saveAnno = async () => {
    setLoading(true);
    await dispatch(saveLabelImageAnnotation());
    setLoading(false);
  };
  const saveAndNext = async () => {
    await saveAnno();
    dispatch(thunkGoNextImage());
  };
  const saveAndPrev = async () => {
    await saveAnno();
    dispatch(thunkGoPrevImage());
  };
  const saveAndDone = async () => {
    await saveAnno();
    closeDialog();
  };
  const saveAndGoCapture = async () => {
    await saveAndDone();
    onSaveAndGoCaptured();
  };

  const saveClassification = async () => {
    setLoading(true);
    await dispatch(createClassification({ x: -100, y: -100 }, selectedImageId, selectedPartId));
    await dispatch(saveClassificationImageTag());
    setLoading(false);
  };

  const saveClassificationAndDone = async () => {
    await saveClassification();
    closeDialog();
  };

  const saveClassificationAndNext = async () => {
    await saveClassification();
    dispatch(thunkGoNextImage());
  };
  const saveClassificationAndPrev = async () => {
    await saveClassification();
    dispatch(thunkGoPrevImage());
  };

  const onDeleteImage = async () => {
    setLoading(true);
    await dispatch(deleteImage(selectedImageId));
    setLoading(false);
  };

  const onRenderImage = (): JSX.Element => (
    <>
      {project.projectType === 'Classification' && (
        <Stack className={labelingPageStyle.imgCover}>
          {selectedPartId === 0 && image?.part_ids.length === 1 && (
            <Stack className={labelingPageStyle.covertText}>
              {getPart(parts, parseInt(image.part_ids[0], 10)).name}
            </Stack>
          )}
          {selectedPartId !== 0 && (
            <Stack className={labelingPageStyle.covertText}>{getPart(parts, selectedPartId).name}</Stack>
          )}
        </Stack>
      )}
      <Scene
        url={imageUrl}
        annotations={annotations}
        workState={workState}
        setWorkState={setWorkState}
        labelingType={LabelingType.MultiAnnotation}
        onBoxCreated={dummyFunction}
        parts={parts}
        selectedImageId={selectedImageId}
      />
      <Text variant="small" styles={{ root: { position: 'absolute', left: 5, bottom: 5 } }}>
        {cameraName}
      </Text>
      <Text variant="small" styles={{ root: { position: 'absolute', right: 5, bottom: 5 } }}>
        {imageTimeStamp}
      </Text>
    </>
  );

  const onRenderPrediction = (): JSX.Element => {
    if (!imgIsRelabel) return null;
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
      <PartPicker trainingProject={imageProjectId} />
    </>
  );

  const onRenderClassificationFooter = (): JSX.Element => {
    const deleteDisabled = loading;

    if (noPrevAndNext)
      return (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <DefaultButton text="Delete Image" onClick={onDeleteImage} disabled={deleteDisabled} />
          <DefaultButton text="Close" onClick={closeDialog} />
        </Stack>
      );

    const isLastImg = index === imageIds.length - 1;
    const previousDisabled = index === 0 || selectedPartId === 0 || loading;
    const nextDisabled = isLastImg || selectedPartId === 0 || loading;
    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
        <DefaultButton text="Delete Image" onClick={onDeleteImage} disabled={deleteDisabled} />
        <Text style={{ marginLeft: 'auto' }}>
          Image {index + 1} of {imageIds.length}
        </Text>
        <DefaultButton text="Previous" onClick={saveClassificationAndPrev} disabled={previousDisabled} />
        <PrimaryButton text="Next" onClick={saveClassificationAndNext} disabled={nextDisabled} />
        <Separator vertical />
        {canBackToCapture && (
          <DefaultButton text="Save and capture another image" onClick={saveAndGoCapture} />
        )}
        <DefaultButton text="Done" primary={isLastImg} onClick={saveClassificationAndDone} />
      </Stack>
    );
  };

  const onRenderFooter = (): JSX.Element => {
    const noAnno = annotations.length === 0;
    const deleteDisabled = loading;
    const saveDisabled = noAnno;

    if (noPrevAndNext)
      return (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton
            text="Save and close"
            style={{ marginLeft: 'auto' }}
            onClick={saveAndDone}
            disabled={saveDisabled}
          />
          <DefaultButton text="Delete Image" onClick={onDeleteImage} disabled={deleteDisabled} />
          <DefaultButton text="Close" onClick={closeDialog} />
        </Stack>
      );

    const isLastImg = index === imageIds.length - 1;
    const previousDisabled = index === 0 || workState === WorkState.Creating || isOnePointBox || loading;
    const nextDisabled = isLastImg || noAnno || workState === WorkState.Creating || isOnePointBox || loading;
    return (
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
        <DefaultButton text="Delete Image" onClick={onDeleteImage} disabled={deleteDisabled} />
        <Text style={{ marginLeft: 'auto' }}>
          Image {index + 1} of {imageIds.length}
        </Text>
        <DefaultButton text="Previous" onClick={saveAndPrev} disabled={previousDisabled} />
        <PrimaryButton text="Next" disabled={nextDisabled} onClick={saveAndNext} />
        <Separator vertical />
        {canBackToCapture && (
          <DefaultButton text="Save and capture another image" onClick={saveAndGoCapture} />
        )}
        <DefaultButton text="Done" primary={isLastImg} onClick={saveAndDone} />
      </Stack>
    );
  };

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
        {project.projectType === 'ObjectDetection' ? onRenderFooter() : onRenderClassificationFooter()}
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
