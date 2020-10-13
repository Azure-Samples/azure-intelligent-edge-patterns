import React, { useState, useMemo } from 'react';
import { CommandBar, ICommandBarItemProps, getTheme, Stack, Breadcrumb } from '@fluentui/react';
import { useConstCallback } from '@uifabric/react-hooks';
import { PartDetailList } from '../components/PartDetailList';
import { AddEditPartPanel, PanelMode } from '../components/AddPartPanel';

const theme = getTheme();

export const Parts: React.FC = () => {
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
    [openPanel],
  );

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Breadcrumb items={[{ key: 'parts', text: 'Objects' }]} />
        <PartDetailList onAddBtnClick={openPanel} />
      </Stack>
      <AddEditPartPanel isOpen={isPanelOpen} onDissmiss={dismissPanel} mode={PanelMode.Create} />
    </Stack>
  );
};
