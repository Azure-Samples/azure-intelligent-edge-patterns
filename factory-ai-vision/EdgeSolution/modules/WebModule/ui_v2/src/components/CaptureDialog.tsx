import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Dropdown,
  Stack,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  getTheme,
  mergeStyleSets,
  IDropdownOption,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';
import { RTSPVideo } from './RTSPVideo';
import { cameraOptionsSelector, selectCameraById, getCameras } from '../store/cameraSlice';

const { palette } = getTheme();

const functionBtnStyleSets = mergeStyleSets({
  button: { width: '90%' },
  icon: { color: palette.themePrimary },
});

export enum CaptureLabelMode {
  PerImage,
  AllLater,
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
  const dispatch = useDispatch();

  const onDropdownChange = (_, opt: IDropdownOption) => {
    setSelectedCameraId(opt.key as number);
  };

  useEffect(() => {
    dispatch(getCameras(false));
  }, [dispatch]);

  return (
    <Dialog
      dialogContentProps={{ title: 'Capture', styles: { content: { width: '1080px' } } }}
      hidden={!isOpen}
      onDismiss={onDismiss}
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
              <RTSPVideo rtsp={rtsp} />
            </Stack>
            <Stack verticalAlign="center" tokens={{ childrenGap: 10 }} styles={{ root: { width: '25%' } }}>
              <DefaultButton
                text="Capture"
                iconProps={{ iconName: 'Camera', className: functionBtnStyleSets.icon }}
                className={functionBtnStyleSets.button}
              />
              {captureLabelMode === CaptureLabelMode.AllLater && (
                <DefaultButton
                  text="Save capture"
                  iconProps={{ iconName: 'Save', className: functionBtnStyleSets.icon }}
                  className={functionBtnStyleSets.button}
                />
              )}
              <DefaultButton
                text="Try again"
                iconProps={{ iconName: 'Refresh', className: functionBtnStyleSets.icon }}
                className={functionBtnStyleSets.button}
              />
            </Stack>
          </Stack>
        </Stack>
        <DialogFooter>
          {captureLabelMode === CaptureLabelMode.PerImage && <PrimaryButton text="Next" />}
          <DefaultButton text="Cancel" onClick={onDismiss} />
        </DialogFooter>
      </>
    </Dialog>
  );
};
