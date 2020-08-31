import React, { useState, useMemo } from 'react';
import { ICommandBarItemProps, Stack, CommandBar, getTheme, Breadcrumb } from '@fluentui/react';
import { EmptyAddIcon } from '../components/EmptyAddIcon';
import { CaptureDialog, CaptureLabelMode } from '../components/CaptureDialog';

const theme = getTheme();

export const Images: React.FC = () => {
  const [isCaptureDialgOpen, setCaptureDialogOpen] = useState(false);
  const openCaptureDialog = () => setCaptureDialogOpen(true);
  const closeCaptureDialog = () => setCaptureDialogOpen(false);

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'uploadImages',
        text: 'Upload images',
        iconProps: {
          iconName: 'Upload',
        },
        onClick: () => {},
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

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={[{ key: 'images', text: 'Images' }]} />
          <EmptyAddIcon
            title="Add images"
            subTitle="Capture images from your video streams and tag parts"
            primary={{ text: 'Capture from camera', onClick: openCaptureDialog }}
            secondary={{ text: 'Upload images', onClick: () => {} }}
          />
        </Stack>
      </Stack>
      <CaptureDialog
        captureLabelMode={CaptureLabelMode.PerImage}
        isOpen={isCaptureDialgOpen}
        onDismiss={closeCaptureDialog}
      />
    </>
  );
};
