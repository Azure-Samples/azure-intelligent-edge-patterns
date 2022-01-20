import React, { useState, useEffect, useRef, ReactText } from 'react';
import {
  Dialog,
  Dropdown,
  Stack,
  DialogFooter,
  DefaultButton,
  getTheme,
  mergeStyleSets,
  IDropdownOption,
  Text,
  Spinner,
} from '@fluentui/react';
import { useSelector, connect } from 'react-redux';
import { AcceptMediumIcon } from '@fluentui/react-icons';

import { RTSPVideo } from './RTSPVideo';
import { cameraOptionsSelector, getCameras as getCamerasAction } from '../store/cameraSlice';
import { captureImage as captureImgAction } from '../store/imageSlice';
import { OpenFrom, openLabelingPage as openLabelingPageAction } from '../store/labelingPageSlice';

const { palette } = getTheme();

const functionBtnStyleSets = mergeStyleSets({
  button: { width: '90%' },
  icon: { color: palette.themePrimary },
});

enum Status {
  Waiting,
  Capturing,
  Success,
}

type OwnProps = {
  isOpen: boolean;
  onDismiss: () => void;
  partId?: number;
};

type CaptureDialogProps = OwnProps & {
  captureImage;
  openLabelingPage;
  getCameras;
};

const mapDispatch = (dispatch) => ({
  captureImage: (action) => dispatch(captureImgAction(action)),
  openLabelingPage: (action) => dispatch(openLabelingPageAction(action)),
  getCameras: (action) => dispatch(getCamerasAction(action)),
});

export const Component: React.FC<CaptureDialogProps> = ({
  isOpen,
  onDismiss,
  partId = null,
  captureImage,
  openLabelingPage,
  getCameras,
}) => {
  const cameraOptions = useSelector(cameraOptionsSelector);
  const [selectedCameraId, setSelectedCameraId] = useState(
    cameraOptions.length === 1 ? cameraOptions[0].key : null,
  );
  const [status, setStatus] = useState<Status>(Status.Waiting);
  const streamIdRef = useRef('');
  const capturedImgs = useRef<number[]>([]);

  const closeDialog = () => {
    setStatus(Status.Waiting);
    capturedImgs.current = [];
    onDismiss();
  };

  const onDropdownChange = (_, opt: IDropdownOption) => {
    setSelectedCameraId(opt.key as number);
  };

  const onCaptureClick = async () => {
    setStatus(Status.Capturing);
    const action = await captureImage({
      streamId: streamIdRef.current,
      imageIds: [],
      shouldOpenLabelingPage: false,
    });
    const { payload } = action as any;
    if (payload) capturedImgs.current.push(parseInt(Object.keys(payload.images)[0], 10));
    setStatus(Status.Success);
  };

  const onGoTaggingClick = () => {
    openLabelingPage({
      imageIds: capturedImgs.current,
      selectedImageId: capturedImgs.current[0],
      openFrom: OpenFrom.CaptureDialog,
    });
    closeDialog();
  };

  useEffect(() => {
    (async () => {
      const res = await getCameras(false);
      if (res?.payload?.result.length === 1) setSelectedCameraId(res.payload.result[0]);
    })();
  }, [getCameras]);

  useEffect(() => {
    if (status === Status.Success) {
      const resetSuccess = setTimeout(() => setStatus(Status.Waiting), 3000);
      return () => {
        clearTimeout(resetSuccess);
      };
    }
  }, [status]);

  return (
    <Dialog
      dialogContentProps={{ title: 'Capture', styles: { content: { width: '1080px' } } }}
      hidden={!isOpen}
      onDismiss={closeDialog}
      modalProps={{
        isBlocking: true,
        layerProps: {
          eventBubblingEnabled: true,
        },
      }}
      maxWidth={9999}
    >
      <>
        <Stack tokens={{ childrenGap: 10 }}>
          <Dropdown
            label="Select camera"
            options={cameraOptions}
            selectedKey={selectedCameraId}
            onChange={onDropdownChange}
            styles={{ dropdown: { width: '300px' } }}
          />
          <Stack horizontal tokens={{ childrenGap: 30 }}>
            <Stack styles={{ root: { width: '75%', height: '500px', position: 'relative' } }}>
              <RTSPVideo
                cameraId={selectedCameraId}
                onStreamCreated={(streamId) => {
                  streamIdRef.current = streamId;
                }}
                partId={partId}
              />
              <CaptureBanner top="80%" left="50%" status={status} />
            </Stack>
            <Stack verticalAlign="center" tokens={{ childrenGap: 10 }} styles={{ root: { width: '25%' } }}>
              <DefaultButton
                text="Capture image"
                iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
                className={functionBtnStyleSets.button}
                onClick={onCaptureClick}
              />
              {capturedImgs.current.length > 0 && (
                <DefaultButton
                  text="Go to tagging"
                  iconProps={{ iconName: 'Tag', className: functionBtnStyleSets.icon }}
                  className={functionBtnStyleSets.button}
                  onClick={onGoTaggingClick}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
        <DialogFooter>
          <DefaultButton text="Done" onClick={closeDialog} />
        </DialogFooter>
      </>
    </Dialog>
  );
};

export const CaptureDialog = connect(null, mapDispatch)(Component);

const CaptureBanner: React.FC<{ top: ReactText; left: ReactText; status: Status }> = ({
  top,
  left,
  status,
}) => {
  if (status === Status.Waiting) return null;

  return (
    <Stack
      tokens={{ childrenGap: 10 }}
      horizontal
      horizontalAlign="center"
      verticalAlign="center"
      styles={{
        root: {
          position: 'absolute',
          width: '160px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          borderRadius: '2px',
          transform: 'translateX(-50%)',
          top,
          left,
        },
      }}
    >
      {status === Status.Capturing ? (
        <Spinner />
      ) : (
        <>
          <AcceptMediumIcon
            style={{
              borderRadius: '100%',
              backgroundColor: '#57A300',
              color: 'white',
              padding: '5px',
              fontSize: '8px',
              textAlign: 'center',
            }}
          />
          <Text>Image saved!</Text>
        </>
      )}
    </Stack>
  );
};
