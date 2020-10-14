import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ICommandBarItemProps,
  Stack,
  CommandBar,
  getTheme,
  Breadcrumb,
  Pivot,
  PivotItem,
  MessageBar,
  Separator,
  mergeStyleSets,
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { EmptyAddIcon } from '../components/EmptyAddIcon';
import { CaptureDialog } from '../components/CaptureDialog';
import { postImages, getImages, selectAllImages } from '../store/imageSlice';
import { ImageList } from '../components/ImageList';
import { selectImageItemByUntagged, selectImageItemByRelabel } from '../store/selectors';
import { getParts } from '../store/partSlice';
import LabelingPage from '../components/LabelingPage/LabelingPage';
import { useInterval } from '../hooks/useInterval';
import { Instruction } from '../components/Instruction';
import { Status } from '../store/project/projectTypes';

const theme = getTheme();
const classes = mergeStyleSets({
  seperator: {
    margin: '20px 0px',
  },
});

export const Images: React.FC = () => {
  const [isCaptureDialgOpen, setCaptureDialogOpen] = useState(false);
  const openCaptureDialog = () => setCaptureDialogOpen(true);
  const closeCaptureDialog = () => setCaptureDialogOpen(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const labeledImages = useSelector(selectImageItemByUntagged(false));
  const unlabeledImages = useSelector(selectImageItemByUntagged(true));
  const relabelImages = useSelector(selectImageItemByRelabel());
  const nonDemoProjectId = useSelector((state: State) => state.trainingProject.nonDemo[0]);
  const imageAddedButNoAnno = useSelector(
    (state: State) => state.labelImages.ids.length > 0 && state.annotations.ids.length === 0,
  );
  const labeledImagesLessThanFifteen = useSelector(
    (state: State) => state.annotations.ids.length > 0 && labeledImages.length < 15,
  );
  const imageIsEnoughForTraining = useSelector(
    (state: State) => state.project.status === Status.None && labeledImages.length >= 15,
  );
  const relabelImgsReadyToTrain = useSelector(
    (state: State) =>
      selectAllImages(state).filter((e) => e.isRelabel && e.manualChecked && !e.uploaded).length,
  );

  const onUpload = () => {
    fileInputRef.current.click();
  };

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>): void {
    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      dispatch(postImages(formData));
    }
  }

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'uploadImages',
        text: 'Upload images',
        iconProps: {
          iconName: 'Upload',
        },
        onClick: onUpload,
      },
      {
        key: 'captureFromCamera',
        text: 'Capture from camera',
        iconProps: {
          iconName: 'Camera',
        },
        onClick: openCaptureDialog,
      },
    ],
    [],
  );

  useEffect(() => {
    dispatch(getImages());
    // For image list items
    dispatch(getParts());
  }, [dispatch]);

  useInterval(
    () => {
      Axios.post(`/api/projects/${nonDemoProjectId}/relabel_keep_alive/`);
    },
    relabelImages.length > 0 ? 3000 : null,
  );

  const onRenderInstructionInsidePivot = () => (
    <>
      {imageAddedButNoAnno && (
        <Instruction
          title="Successfully added images!"
          subtitle="Now identify what is in your images to start training your model."
          smallIcon
        />
      )}
      {labeledImagesLessThanFifteen && (
        <Instruction
          title="Images have been tagged!"
          subtitle="Continue adding and tagging more images to improve your model. We recommend at least 15 images per object."
          smallIcon
        />
      )}
    </>
  );

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          {imageIsEnoughForTraining && (
            <Instruction
              title="Successfully added and tagged enough photos!"
              subtitle="Now you can start deploying your model."
              button={{ text: 'Go to Home', to: '/home/customize' }}
            />
          )}
          {relabelImgsReadyToTrain > 0 && (
            <Instruction
              title={`${relabelImgsReadyToTrain} images saved from the current deployment have been tagged!`}
              subtitle="Update the deployment to retrain the model"
              button={{
                text: 'Update model',
                to: '/home/deployment',
              }}
            />
          )}
          <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
          {labeledImages.length + unlabeledImages.length ? (
            <Pivot>
              <PivotItem headerText="Untagged">
                {onRenderInstructionInsidePivot()}
                {unlabeledImages.length === 0 && relabelImages.length === 0 ? (
                  <EmptyAddIcon
                    title="Looks like you don’t have any untagged images"
                    subTitle="Continue adding and tagging more images from your video streams to improve your model"
                    primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
                    secondary={{ text: 'Upload images', onClick: onUpload }}
                  />
                ) : (
                  <>
                    <Separator alignContent="start" className={classes.seperator}>
                      Deployment captures
                    </Separator>
                    {relabelImages.length > 0 && (
                      <MessageBar styles={{ root: { margin: '12px 0px' } }}>
                        Images saved from the current deployment. Confirm or modify the objects identified to
                        improve your model.
                      </MessageBar>
                    )}
                    <ImageList images={relabelImages} />
                    <Separator alignContent="start" className={classes.seperator}>
                      Manually added
                    </Separator>
                    <ImageList images={unlabeledImages} />
                  </>
                )}
              </PivotItem>
              <PivotItem headerText="Tagged">
                {onRenderInstructionInsidePivot()}
                <ImageList images={labeledImages} />
              </PivotItem>
            </Pivot>
          ) : (
            <EmptyAddIcon
              title="Add images"
              subTitle="Capture images from your video streams and tag parts"
              primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
              secondary={{ text: 'Upload images', onClick: onUpload }}
            />
          )}
        </Stack>
      </Stack>
      <CaptureDialog isOpen={isCaptureDialgOpen} onDismiss={closeCaptureDialog} />
      <LabelingPage onSaveAndGoCaptured={openCaptureDialog} />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
    </>
  );
};
