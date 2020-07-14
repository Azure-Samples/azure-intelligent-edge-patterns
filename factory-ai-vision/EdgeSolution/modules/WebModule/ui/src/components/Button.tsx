import React from 'react';
import { Button as FluentButton, ButtonProps, mergeStyles } from '@fluentui/react-northstar';
import * as R from 'ramda';

export const Button: React.FC<ButtonProps & { as?: any; to?: any }> = ({ children, ...props }) => {
  const newProps = R.clone(props);
  if (newProps.circular) newProps.styles = mergeStyles(newProps.styles, { padding: '0px 20px' });
  if (newProps.loading) newProps.disabled = true;

  return <FluentButton {...newProps}>{children}</FluentButton>;
};
