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
  Breadcrumb,
} from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';
import { CameraDetailList } from '../components/CameraDetailList';

const theme = getTheme();

export const Cameras: React.FC = () => {
  const [isPanelOpen, setPanelOpen] = useState(false);

  const dismissPanel = useConstCallback(() => setPanelOpen(false));
  const openPanel = useConstCallback(() => setPanelOpen(true));

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: openPanel,
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
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Breadcrumb items={[{ key: 'cameras', text: 'Cameras' }]} />
        <CameraDetailList onAddBtnClick={openPanel} />
      </Stack>
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
    </Stack>
  );
};
