/* eslint-disable react/display-name */
import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  CommandBar,
  ICommandBarItemProps,
  IButtonStyles,
  getTheme,
  ICommandBarStyles,
  mergeStyleSets,
} from '@fluentui/react';
import { WaffleIcon, SettingsIcon, FeedbackIcon, RingerIcon } from '@fluentui/react-icons';
import { useBoolean } from '@uifabric/react-hooks';
import { useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { selectUnreadNotification } from '../store/notificationSlice';
import { Url } from '../enums';

import { NotificationPanel } from './NotificationPanel';

const theme = getTheme();

const commandBarBtnStyles: IButtonStyles = {
  root: {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
  rootHovered: {
    backgroundColor: theme.palette.themeDark,
    color: theme.palette.white,
  },
  rootPressed: {
    backgroundColor: theme.palette.themeDarker,
    color: theme.palette.white,
  },
};

const commandBarStyles: ICommandBarStyles = {
  root: {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
};

const classes = mergeStyleSets({
  badage: {
    position: 'absolute',
    right: 5,
    top: 10,
    background: '#005A9E',
    color: 'white',
    borderRadius: '16px',
    width: '16px',
    height: '16px',
    fontSize: '10px',
  },
  icon: {
    fontSize: '16px',
  },
});

type TopNavProps = {
  onSettingClick: () => void;
};

export const TopNav: React.FC<TopNavProps> = ({ onSettingClick }) => {
  const history = useHistory();
  const [notificationOpen, { setFalse: closeNotification, setTrue: openNotification }] = useBoolean(false);
  const notificationCount = useSelector((state: State) => selectUnreadNotification(state).length);

  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'feedback',
      iconOnly: true,
      onRenderIcon: () => <FeedbackIcon className={classes.icon} />,
      buttonStyles: commandBarBtnStyles,
      onClick: () => {
        const win = window.open('https://go.microsoft.com/fwlink/?linkid=2173532', '_blank');
        win.focus();
      },
    },
    {
      key: 'notification',
      iconOnly: true,
      onRenderIcon: () => {
        return (
          <div>
            {!!notificationCount && <div className={classes.badage}>{notificationCount}</div>}
            <RingerIcon className={classes.icon} />
          </div>
        );
      },
      buttonStyles: commandBarBtnStyles,
      onClick: openNotification,
    },
    {
      key: 'setting',
      iconOnly: true,
      onRenderIcon: () => <SettingsIcon className={classes.icon} />,
      buttonStyles: commandBarBtnStyles,
      onClick: onSettingClick,
    },
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'btn',
      iconOnly: true,
      onRenderIcon: () => <WaffleIcon style={{ fontSize: '20px' }} />,
      buttonStyles: commandBarBtnStyles,
      onClick: () => history.push(Url.HOME),
    },
    {
      key: 'title',
      text: 'Vision on Edge',
      buttonStyles: commandBarBtnStyles,
      onClick: () => history.push(Url.HOME),
    },
  ];

  return (
    <>
      <CommandBar styles={commandBarStyles} items={commandBarItems} farItems={commandBarFarItems} />
      {/* <FeedbackDialog hidden={feedbackHidden} onDismiss={closeFeedback} /> */}
      <NotificationPanel isOpen={notificationOpen} onDismiss={closeNotification} />
    </>
  );
};
