import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  Dropdown,
  Stack,
  DialogFooter,
  DefaultButton,
  getTheme,
  mergeStyleSets,
  IDropdownOption,
  Separator,
  Text,
  Spinner,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { AcceptMediumIcon } from '@fluentui/react-icons';
import { useHistory } from 'react-router-dom';

import { State } from 'RootStateType';
import { RTSPVideo } from './RTSPVideo';
import { cameraOptionsSelector, selectCameraById, getCameras } from '../store/cameraSlice';
import { captureImage } from '../store/imageSlice';

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
  const history = useHistory();

  const closeDialog = () => {
    setStatus(Status.Waiting);
    onDismiss();
  };

  const onDropdownChange = (_, opt: IDropdownOption) => {
    setSelectedCameraId(opt.key as number);
  };

  const onCaptureClick = async () => {
    setStatus(Status.Capturing);
    await dispatch(
      captureImage({ streamId: streamIdRef.current, imageIds: [], shouldOpenLabelingPage: false }),
    );
    setStatus(Status.Success);
  };

  useEffect(() => {
    dispatch(getCameras(false));
  }, [dispatch]);

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
            <Stack styles={{ root: { width: '75%', height: '500px' } }}>
              <RTSPVideo
                rtsp={rtsp}
                onStreamCreated={(streamId) => {
                  streamIdRef.current = streamId;
                }}
              />
            </Stack>
            <Stack verticalAlign="center" tokens={{ childrenGap: 10 }} styles={{ root: { width: '25%' } }}>
              {status === Status.Success && <CaptureSuccessIcon />}
              {status === Status.Capturing && <Spinner />}
              {status !== Status.Waiting && <Separator />}
              <DefaultButton
                text={status === Status.Waiting ? 'Capture image' : 'Capture another image'}
                iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
                className={functionBtnStyleSets.button}
                onClick={onCaptureClick}
              />
              {status !== Status.Waiting && (
                <DefaultButton
                  text="Tag images"
                  iconProps={{ iconName: 'Tag', className: functionBtnStyleSets.icon }}
                  className={functionBtnStyleSets.button}
                  onClick={() => {
                    closeDialog();
                    history.push('/images');
                  }}
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

const CaptureSuccessIcon: React.FC = () => {
  return (
    <Stack tokens={{ childrenGap: 10 }} horizontalAlign="center">
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
    </Stack>
  );
};
