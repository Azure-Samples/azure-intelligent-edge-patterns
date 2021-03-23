/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import React from 'react';
import { Icon, IIconProps } from '@fluentui/react/lib/Icon';
import { iconStyles } from './fluentUiStyles';
import './Header.css';

export const Header: React.FC = () => {
  const iconProps: IIconProps = { styles: iconStyles, iconName: 'Ringer' };

  return (
    <header className="App-header">
      <img src="/pea-logo.svg" height="28px" alt="Patient Edge Analysis logo" />
      <Icon {...iconProps} />
    </header>
  );
};
