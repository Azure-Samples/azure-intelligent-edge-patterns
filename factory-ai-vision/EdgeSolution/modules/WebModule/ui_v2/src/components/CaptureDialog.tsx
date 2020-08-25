import React from 'react';
import {
  Dialog,
  Dropdown,
  Stack,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  getTheme,
  mergeStyleSets,
} from '@fluentui/react';
import { RTSPVideo } from './RTSPVideo';
import { CaptureLabelMode } from './RTSPVideo/RTSPVideo.type';

const { palette } = getTheme();

const functionBtnStyleSets = mergeStyleSets({
  button: { width: '90%' },
  icon: { color: palette.themePrimary },
});

export const CaptureDialog: React.FC<{ captureLabelMode: CaptureLabelMode }> = ({ captureLabelMode }) => {
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
          <Dropdown label="Select camera" options={[]} styles={{ dropdown: { width: '300px' } }} />
          <Stack horizontal tokens={{ childrenGap: 30 }}>
            <Stack styles={{ root: { width: '75%' } }}>
              <RTSPVideo rtsp={'rtsp://211.22.28.157:20554/s1'} autoPlay canCapture />
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
