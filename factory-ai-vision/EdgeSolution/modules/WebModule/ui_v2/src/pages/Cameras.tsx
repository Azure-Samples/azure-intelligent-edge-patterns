import React, { useState, useMemo } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Panel,
  TextField,
  PrimaryButton,
  DefaultButton,
  Stack,
} from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';

const theme = getTheme();

export const Cameras: React.FC = () => {
  const [isPanelOpen, setPanelOpen] = useState(false);

  const dismissPanel = useConstCallback(() => setPanelOpen(false));

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setPanelOpen(true),
      },
    ],
    [],
  );

  const onRenderFooterContent = useConstCallback(() => (
    <Stack tokens={{ childrenGap: 5 }} horizontal>
      <PrimaryButton onClick={dismissPanel}>Add</PrimaryButton>
      <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
    </Stack>
  ));

  return (
    <>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Panel
        isOpen={isPanelOpen}
        onDismiss={dismissPanel}
        hasCloseButton
        headerText="Add Camera"
        isHiddenOnDismiss
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
      >
        <TextField label="Camera name" required />
        <TextField label="RTSP URL" required />
        <TextField label="Location" required />
      </Panel>
    </>
  );
};
