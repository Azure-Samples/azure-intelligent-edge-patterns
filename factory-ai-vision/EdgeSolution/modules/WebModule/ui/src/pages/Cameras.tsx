import React, { useState, useMemo } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Breadcrumb } from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';
import { useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { CameraDetailList } from '../components/CameraDetailList';
import AddCameraPanel, { PanelMode } from '../components/AddCameraPanel';
import { Instruction } from '../components/Instruction';

const theme = getTheme();

export const Cameras: React.FC = () => {
  const [isPanelOpen, setPanelOpen] = useState(false);
  const showInstruction = useSelector(
    (state: State) => state.camera.nonDemo.length > 0 && state.labelImages.ids.length === 0,
  );

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
    [openPanel],
  );

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        {showInstruction && (
          <Instruction
            title="Successfully added a camera!"
            subtitle="Now that you have added a camera, you can use that camera to capture images and tag objects for your model."
            button={{ text: 'Go to Images', to: '/images' }}
          />
        )}
        <Breadcrumb items={[{ key: 'cameras', text: 'Cameras' }]} />
        <CameraDetailList onAddBtnClick={openPanel} />
      </Stack>
      <AddCameraPanel isOpen={isPanelOpen} onDissmiss={dismissPanel} mode={PanelMode.Create} />
    </Stack>
  );
};
