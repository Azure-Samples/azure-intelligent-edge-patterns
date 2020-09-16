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
} from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import { EmptyAddIcon } from '../components/EmptyAddIcon';
import { CaptureDialog } from '../components/CaptureDialog';
import { postImages, getImages } from '../store/imageSlice';
import { ImageList } from '../components/ImageList';
import { selectImageItemByUntagged, selectImageItemByRelabel } from '../store/selectors';
import { getParts } from '../store/partSlice';
import LabelingPage, { LabelPageMode } from '../components/LabelingPage/LabelingPage';
import { useInterval } from '../hooks/useInterval';

const theme = getTheme();

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

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
          {labeledImages.length + unlabeledImages.length ? (
            <Pivot>
              <PivotItem headerText="Untagged">
                {unlabeledImages.length === 0 ? (
                  <EmptyAddIcon
                    title="Looks like you don’t have any untagged images"
                    subTitle="Continue adding and tagging more images from your video streams to improve your model"
                    primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
                    secondary={{ text: 'Upload images', onClick: onUpload }}
                  />
                ) : (
                  <>
                    {relabelImages.length > 0 && (
                      <MessageBar styles={{ root: { margin: '12px 0px' } }}>
                        Images saved from the current deployment. Confirm or modify the objects identified to
                        improve your model.
                      </MessageBar>
                    )}
                    <ImageList images={relabelImages} />
                    <ImageList images={unlabeledImages} />
                  </>
                )}
              </PivotItem>
              <PivotItem headerText="Tagged">
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
      <LabelingPage mode={LabelPageMode.MultiPage} />
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
