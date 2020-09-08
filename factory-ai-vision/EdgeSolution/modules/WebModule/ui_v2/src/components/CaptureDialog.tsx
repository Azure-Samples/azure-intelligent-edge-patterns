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
import { useSelector, useDispatch } from 'react-redux';
import { AcceptMediumIcon } from '@fluentui/react-icons';

import { State } from 'RootStateType';
import { RTSPVideo } from './RTSPVideo';
import { cameraOptionsSelector, selectCameraById, getCameras } from '../store/cameraSlice';
import { captureImage } from '../store/imageSlice';
import { openLabelingPage } from '../store/labelingPageSlice';

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

type CaptureDialogProps = {
  isOpen: boolean;
  onDismiss: () => void;
  defaultSelectedCameraId?: number;
};

export const CaptureDialog: React.FC<CaptureDialogProps> = ({
  isOpen,
  onDismiss,
  defaultSelectedCameraId,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState(defaultSelectedCameraId);
  const cameraOptions = useSelector(cameraOptionsSelector);
  const rtsp = useSelector((state: State) => selectCameraById(state, selectedCameraId)?.rtsp);
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Waiting);
  const streamIdRef = useRef('');
  const capturedImgs = useRef([]);

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
    const action = await dispatch(
      captureImage({ streamId: streamIdRef.current, imageIds: [], shouldOpenLabelingPage: false }),
    );
    const { payload } = action as any;
    if (payload) capturedImgs.current.push(Object.keys(payload.images)[0]);
    setStatus(Status.Success);
  };

  const onGoTaggingClick = () => {
    onDismiss();
    dispatch(openLabelingPage({ imageIds: capturedImgs.current, selectedImageId: capturedImgs.current[0] }));
  };

  useEffect(() => {
    dispatch(getCameras(false));
  }, [dispatch]);

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
                rtsp={rtsp}
                onStreamCreated={(streamId) => {
                  streamIdRef.current = streamId;
                }}
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
