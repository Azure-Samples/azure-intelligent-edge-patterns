import React, { useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Stack, CommandBar, getTheme, ICommandBarItemProps, Pivot, PivotItem } from '@fluentui/react';
import { GetStarted } from '../components/GetStarted';

const theme = getTheme();

export const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

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

  const onPivotChange = (item: PivotItem) => {
    history.push(`/${item.props.itemKey}`);
  };

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Pivot selectedKey={location.pathname.split('/')[1]} onLinkClick={onPivotChange}>
          <PivotItem itemKey="getStarted" headerText="Get started">
            <GetStarted />
          </PivotItem>
          <PivotItem itemKey="task" headerText="Task">
            Task
          </PivotItem>
        </Pivot>
      </Stack>
    </Stack>
  );
};
