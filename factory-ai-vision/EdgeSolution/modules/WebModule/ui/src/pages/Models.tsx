import React, { useMemo } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Breadcrumb } from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';

import ModelComponent from '../components/Models/Model';
import AddModelPanel, { PanelMode } from '../components/Models/AddModelPanel';

const theme = getTheme();

export const Models = () => {
  const [isPanelOpen, { setTrue: handlePanelOpen, setFalse: handlePanelDissmiss }] = useBoolean(false);

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: handlePanelOpen,
      },
    ],
    [handlePanelOpen],
  );

  return (
    <>
      <Stack styles={{ root: { height: '100%' } }}>
        <CommandBar
          items={commandBarItems}
          styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
        />
        <Stack styles={{ root: { padding: '15px' } }} grow>
          <Breadcrumb items={[{ key: 'models', text: 'Models' }]} />
          <ModelComponent onAddModelClick={handlePanelOpen} />
        </Stack>
      </Stack>
      <AddModelPanel isOpen={isPanelOpen} onDissmiss={handlePanelDissmiss} mode={PanelMode.Create} />
    </>
  );
};
