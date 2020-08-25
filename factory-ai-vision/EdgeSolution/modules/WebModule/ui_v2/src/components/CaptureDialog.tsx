import React, { useState } from 'react';
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
import { RTSPVideo } from './RTSPVideo';
import { CaptureLabelMode } from './RTSPVideo/RTSPVideo.type';
import { useSelector } from 'react-redux';
import { selectAllCameras, selectCameraById } from '../store/cameraSlice';
import { createSelector } from '@reduxjs/toolkit';
import { State } from 'RootStateType';

const { palette } = getTheme();

const functionBtnStyleSets = mergeStyleSets({
  button: { width: '90%' },
  icon: { color: palette.themePrimary },
});

const cameraOptionsSelector = createSelector(selectAllCameras, (cameras) =>
  cameras.map((e) => ({
    key: e.id,
    text: e.name,
  })),
);

type CaptureDialogProps = {
  captureLabelMode: CaptureLabelMode;
  defaultSelectedCameraId?: number;
};

export const CaptureDialog: React.FC<CaptureDialogProps> = ({
  captureLabelMode,
  defaultSelectedCameraId,
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState(defaultSelectedCameraId);
  const cameraOptions = useSelector(cameraOptionsSelector);
  const rtsp = useSelector((state: State) => selectCameraById(state, selectedCameraId)?.rtsp);

  const onDropdownChange = (_, opt: IDropdownOption) => {
    setSelectedCameraId(opt.key as number);
  };

  return (
    <Dialog
      dialogContentProps={{ title: 'Capture', styles: { content: { width: '1080px' } } }}
      hidden={false}
      onDismiss={() => {}}
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
            <Stack styles={{ root: { width: '75%' } }}>
              <RTSPVideo rtsp={rtsp} autoPlay canCapture />
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
          <DefaultButton text="Cancel" />
        </DialogFooter>
      </>
    </Dialog>
  );
};
