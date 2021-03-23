/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IMessageBarStyles, IPersonaStyles } from '@fluentui/react';

export const personaStyles: IPersonaStyles = {
  root: {
    height: '60px',
    padding: '0px 30px 0px 10px',
    width: '416px',
  },
  details: {
    padding: '0px 20px 0px 10px',
  },
  primaryText: {
    color: 'white',
    fontSize: '20px',
    lineHeight: '24px',
    ':hover': {
      color: 'white',
    },
  },
  secondaryText: {
    color: '#9BCDFF',
    fontSize: '14px',
    lineHeight: '20px',
  },
  tertiaryText: {},
  optionalText: {},
  textContent: {},
};

export const messageBarStyles: IMessageBarStyles = {
  root: {
    width: '416px',
    height: '120px',
    backgroundColor: '#21355B;',
    '.ms-MessageBar-icon': {
      display: 'none',
    },
  },
  dismissal: {
    'i[class*="icon"]': {
      color: 'white',
      fontSize: '12px',
      padding: '14px',
    },
  },
  icon: {
    visibility: 'hidden',
  },
};
