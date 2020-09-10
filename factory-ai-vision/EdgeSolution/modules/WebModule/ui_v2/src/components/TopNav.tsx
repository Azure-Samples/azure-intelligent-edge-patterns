import React from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  IButtonStyles,
  getTheme,
  ICommandBarStyles,
} from '@fluentui/react';
import { WaffleIcon, SettingsIcon } from '@fluentui/react-icons';

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

const commandBarItems: ICommandBarItemProps[] = [
  {
    key: 'btn',
    iconOnly: true,
    onRenderIcon: () => <WaffleIcon style={{ fontSize: '20px' }} />,
    buttonStyles: commandBarBtnStyles,
  },
  {
    key: 'title',
    text: 'Vision on Edge',
    buttonStyles: commandBarBtnStyles,
  },
];

const commandBarStyles: ICommandBarStyles = {
  root: {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
};

export const TopNav: React.FC<{ onSettingClick: () => void }> = ({ onSettingClick }) => {
  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'setting',
      iconOnly: true,
      onRenderIcon: () => <SettingsIcon />,
      buttonStyles: commandBarBtnStyles,
      onClick: onSettingClick,
    },
  ];
  return <CommandBar styles={commandBarStyles} items={commandBarItems} farItems={commandBarFarItems} />;
};
