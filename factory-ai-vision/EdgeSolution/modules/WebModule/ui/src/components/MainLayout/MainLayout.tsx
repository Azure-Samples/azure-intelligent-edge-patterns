import React, { FC, MouseEvent, useState, Dispatch, SetStateAction } from 'react';
import { Grid, Segment, Image, Flex, Text, BellIcon } from '@fluentui/react-northstar';
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';
import Breadcrumb from '../Breadcrumb';
import LeftNav from './LeftNav';
import { Badge } from '../Badge';
import { NotificationPanel } from '../NotificationPanel';
import { openNotificationPanel } from '../../action/creators/notificationActionCreators';
import FeedbackDialog from '../FeedbackDialog';

const LEFT_NAV_WIDTH = 80;

export const MainLayout: FC = ({ children }) => {
  const dispatch = useDispatch();
  const isTrainerValid = useSelector<State, boolean>((state) => state.setting.isTrainerValid);
  const notificationCount = useSelector<State, number>(
    (state) => state.notifications.filter((e) => e.unRead).length,
  );
  const [notificationOpen, setNotificationOpen] = useState(false);

  const openNotification = (open: boolean): void => {
    if (open && notificationCount > 0) dispatch(openNotificationPanel());
    setNotificationOpen(open);
  };

  return (
    <Grid
      columns={`${LEFT_NAV_WIDTH}px auto`}
      rows="50px auto"
      design={{ height: '100vh' }}
      styles={{ justifyContent: 'stretch' }}
    >
      <TopNav
        disabled={!isTrainerValid}
        setNotificationOpen={openNotification}
        notificationCount={notificationCount}
      />
      <LeftNav
        styles={{
          gridColumn: '1 / span 1',
          gridRow: '2 / span 1',
          boxShadow: '1px 0px 10px 0px rgba(0,0,0,0.75)',
          zIndex: 1,
        }}
        disabled={!isTrainerValid}
        width={LEFT_NAV_WIDTH - 40}
      />

      <Segment styles={{ gridColumn: 'span 1', padding: '30px', position: 'relative' }}>
        <Breadcrumb disabled={!isTrainerValid} />
        {children}
        <div
          style={{
            display: notificationOpen ? '' : 'none',
            height: '100%',
            width: '320px',
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 3,
          }}
        >
          <NotificationPanel onDismiss={(): void => setNotificationOpen(false)} />
        </div>
      </Segment>
    </Grid>
  );
};

const TopNav: FC<{
  disabled: boolean;
  setNotificationOpen: Dispatch<SetStateAction<boolean>>;
  notificationCount: number;
}> = ({ disabled, setNotificationOpen, notificationCount }) => {
  return (
    <Flex
      space="between"
      vAlign="center"
      padding="padding.medium"
      styles={{
        backgroundColor: '#0094d8',
        gridColumn: '1 / span 2',
        boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.75)',
        zIndex: 2,
        fontSize: '20px',
        padding: '0.5em 1em',
      }}
    >
      <Flex gap="gap.large" vAlign="center">
        <NavLink
          to={'/'}
          style={{ textDecoration: 'none', cursor: disabled && 'default' }}
          onClick={(e: MouseEvent): void => {
            if (disabled) e.preventDefault();
          }}
        >
          <Flex gap="gap.medium">
            <Image src="/icons/Home_white.png" design={{ width: '30px' }} />
            <Text color="white">Vision on Edge</Text>
          </Flex>
        </NavLink>
      </Flex>
      <Flex
        vAlign="center"
        hAlign="end"
        gap="gap.medium"
        styles={{ height: '100%' }}
        onClick={(e: MouseEvent): void => {
          if (disabled) e.preventDefault();
        }}
      >
        <FeedbackDialog
          trigger={
            <Image
              src="/icons/feedback.png"
              styles={{ height: '100%', ':hover': { cursor: 'pointer' } }}
              onClick={(e: MouseEvent): void => {
                if (disabled) e.preventDefault();
              }}
            />
          }
        />

        <Badge count={notificationCount}>
          <BellIcon
            size="larger"
            styles={{ cursor: 'pointer' }}
            onClick={(): void => setNotificationOpen((prev) => !prev)}
          />
        </Badge>
        <Link to="/setting" style={{ height: '100%', cursor: disabled && 'default' }}>
          <Image styles={{ height: '100%' }} src="/icons/setting.png" />
        </Link>
        <Text color="white">User</Text>
      </Flex>
    </Flex>
  );
};
