/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */
import { Icon, IIconProps } from '@fluentui/react/lib/Icon';
import * as React from 'react';
import { InterpretationCode } from '../../data/VitalsCollection';
import { Colors } from '../../styles/colors';
import { getStatusColor } from '../../util/helpers';

interface Props {
  code: InterpretationCode;
  big?: boolean;
}

export const StatusCircle: React.FC<Props> = ({ code, big = false }) => {
  const color = getStatusColor(code) || '';

  const baseIconStyles = { color, fontSize: big ? 16 : 12, marginRight: 5 };
  const nonSolidIconStyles = { ...baseIconStyles, backgroundColor: 'none', borderRadius: '100%' };

  const iconProps: IIconProps = {
    iconName: color !== Colors.statusGreen ? 'AlertSolid' : 'CircleFill',
    styles: {
      root: color !== Colors.statusGreen ? nonSolidIconStyles : baseIconStyles,
    },
  };

  if (!color) { return <Icon iconName="StatusCircleBlock2" />; }

  return (
    <Icon {...iconProps} />
  );
};
