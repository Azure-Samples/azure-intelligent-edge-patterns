import React, { useMemo, useState } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Breadcrumb } from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';

import ModelComponent from '../components/Models/Model';
import AddModelPanel, { PanelMode } from '../components/Models/AddModelPanel';
import ModelPanel from '../components/Models/AddPanel';

const theme = getTheme();

export const Models = () => {
  const [isPanelOpen, { setTrue: handlePanelOpen, setFalse: handlePanelDissmiss }] = useBoolean(false);
  const [isOpen, setIsOpen] = useState(false);

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
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setIsOpen(true),
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
      <ModelPanel isOpen={isOpen} mode={PanelMode.Create} onDissmiss={() => setIsOpen(false)} />
    </>
  );
};
