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
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { AcceptMediumIcon } from '@fluentui/react-icons';
import { useHistory } from 'react-router-dom';

import { State } from 'RootStateType';
import { RTSPVideo } from './RTSPVideo';
import { cameraOptionsSelector, selectCameraById, getCameras } from '../store/cameraSlice';
import { captureImage, selectAllImages } from '../store/imageSlice';
import { openLabelingPage } from '../store/labelingPageSlice';

const { palette } = getTheme();

const functionBtnStyleSets = mergeStyleSets({
  button: { width: '90%' },
  icon: { color: palette.themePrimary },
});

export enum CaptureLabelMode {
  PerImage,
  AllLater,
}

enum Status {
  Pending,
  HasCaptureAndLabelAll,
  HasCaptureAndLabelOne,
}

type CaptureDialogProps = {
  captureLabelMode: CaptureLabelMode;
  isOpen: boolean;
  onDismiss: () => void;
  defaultSelectedCameraId?: number;
};

export const CaptureDialog: React.FC<CaptureDialogProps> = ({
  captureLabelMode,
  isOpen,
  onDismiss,
  defaultSelectedCameraId,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState(defaultSelectedCameraId);
  const cameraOptions = useSelector(cameraOptionsSelector);
  const rtsp = useSelector((state: State) => selectCameraById(state, selectedCameraId)?.rtsp);
  const lastImg = useSelector((state: State) => selectAllImages(state)[state.labelImages.ids.length - 1]);
  const dispatch = useDispatch();
  const [status, setStatus] = useState<Status>(Status.Pending);
  const streamIdRef = useRef('');
  const history = useHistory();

  const closeDialog = () => {
    setStatus(Status.Pending);
    onDismiss();
  };

  const onDropdownChange = (_, opt: IDropdownOption) => {
    setSelectedCameraId(opt.key as number);
  };

  const onCaptureClick = async () => {
    await dispatch(
      captureImage({ streamId: streamIdRef.current, imageIds: [], shouldOpenLabelingPage: false }),
    );

    if (captureLabelMode === CaptureLabelMode.AllLater) setStatus(Status.HasCaptureAndLabelAll);
    else if (captureLabelMode === CaptureLabelMode.PerImage) setStatus(Status.HasCaptureAndLabelOne);
  };

  useEffect(() => {
    dispatch(getCameras(false));
  }, [dispatch]);

  const onRenderControls = () => {
    if (status === Status.Pending)
      return (
        <DefaultButton
          text="Capture image"
          iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
          className={functionBtnStyleSets.button}
          onClick={onCaptureClick}
        />
      );

    if (status === Status.HasCaptureAndLabelAll)
      return (
        <>
          <CaptureSuccessIcon />
          <DefaultButton
            text="Capture another image"
            iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
            className={functionBtnStyleSets.button}
            onClick={onCaptureClick}
          />
          <DefaultButton
            text="Tag images"
            iconProps={{ iconName: 'Tag', className: functionBtnStyleSets.icon }}
            className={functionBtnStyleSets.button}
            onClick={() => {
              closeDialog();
              history.push('/images');
            }}
          />
        </>
      );

    if (status === Status.HasCaptureAndLabelOne)
      return (
        <>
          <CaptureSuccessIcon />
          <DefaultButton
            text="Capture another image"
            iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
            className={functionBtnStyleSets.button}
            onClick={() => setStatus(Status.Pending)}
          />
          <DefaultButton
            text="Tag this image"
            iconProps={{ iconName: 'Tag', className: functionBtnStyleSets.icon }}
            className={functionBtnStyleSets.button}
            onClick={() => {
              closeDialog();
              dispatch(openLabelingPage({ imageIds: [lastImg.id], selectedImageId: lastImg.id }));
            }}
          />
        </>
      );
  };

  const onRenderMedia = () => {
    if (status === Status.HasCaptureAndLabelOne)
      return <img src={lastImg?.image} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;

    return (
      <RTSPVideo
        rtsp={rtsp}
        onStreamCreated={(streamId) => {
          streamIdRef.current = streamId;
        }}
      />
    );
  };

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
            <Stack styles={{ root: { width: '75%', height: '500px' } }}>{onRenderMedia()}</Stack>
            <Stack verticalAlign="center" tokens={{ childrenGap: 10 }} styles={{ root: { width: '25%' } }}>
              {onRenderControls()}
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
      <Separator />
    </Stack>
  );
};
