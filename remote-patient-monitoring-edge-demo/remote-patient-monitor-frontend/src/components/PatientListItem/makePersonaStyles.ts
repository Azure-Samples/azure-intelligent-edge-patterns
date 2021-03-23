/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IPersonaStyles } from '@fluentui/react';

export const makePersonaStyles = (isBigCard: boolean): IPersonaStyles => ({
  root: {
    height: isBigCard ? '149px' : '96px',
    padding: '20px 0px 20px 20px',
  },
  details: {
    padding: '0px 20px 0px 16px',
  },
  optionalText: {},
  textContent: {},
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
  tertiaryText: {
    color: 'white',
    fontSize: '16px',
    lineHeight: '20px',
    ':hover': {
      color: 'white',
    },
  },
});
