import React, { useMemo } from 'react';
import { Stack, CommandBar, getTheme, ICommandBarItemProps, Pivot, PivotItem } from '@fluentui/react';
import { GetStarted } from '../components/GetStarted';

const theme = getTheme();

export const Home: React.FC = () => {
  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'New Task',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {},
      },
    ],
    [],
  );

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Pivot>
          <PivotItem headerText="Get started">
            <GetStarted />
          </PivotItem>
          <PivotItem headerText="Task">Task</PivotItem>
        </Pivot>
      </Stack>
    </Stack>
  );
};
