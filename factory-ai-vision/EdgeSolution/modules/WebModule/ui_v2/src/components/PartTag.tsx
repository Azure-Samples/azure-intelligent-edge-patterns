import React from 'react';
import { mergeStyleSets, getTheme } from '@fluentui/react';

const { palette } = getTheme();

export enum Status {
  Default,
  Active,
  Inactive,
}

type PartTagProps = {
  status: Status;
  text: string;
};

const tagStyles = mergeStyleSets({
  basic: {
    fontSize: '12px',
    border: '1px solid ',
    borderRadius: '16px',
    textAlign: 'center',
    display: 'inline-block',
    padding: '1px 8px 3px 8px',
  },
  default: {
    borderColor: palette.black,
    color: palette.black,
  },
  active: {
    backgroundColor: palette.themeLighter,
    color: palette.neutralPrimaryAlt,
    borderColor: palette.themePrimary,
  },
  inactive: {
    backgroundColor: palette.neutralLighter,
    color: palette.neutralSecondary,
    borderColor: palette.neutralSecondary,
    borderStyle: 'dashed',
  },
});

const getTagStyles = (status: Status): string => {
  if (status === Status.Default) return tagStyles.default;
  if (status === Status.Active) return tagStyles.active;
  return tagStyles.inactive;
};

export const PartTag: React.FC<PartTagProps> = ({ text, status }) => {
  return <div className={`${tagStyles.basic} ${getTagStyles(status)}`}>{text}</div>;
};
