import { mergeStyleSets } from '@fluentui/react';

export const getClasses = () =>
  mergeStyleSets({
    root: {
      boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
      position: 'relative',
    },
    titleWrapper: {
      padding: '5px 10px',
      borderBottom: '1px solid #edebe9',
      width: '100%',
    },
    title: {
      fontSize: '14px',
      lineHeight: '20px',
      width: '115px',
    },
    label: {
      fontSize: '12px',
      lineHeight: '16px',
    },
    controlBtn: {
      padding: '10px',
      justifyContent: 'center',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
    bottomWrapper: {
      padding: '12px',
    },
    smallLabel: {
      fontSize: '10px',
      lineHeight: '14px',
    },
    addLabel: {
      fontSize: '13px',
      lineHeight: '18px',
    },
    disableCover: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      cursor: 'not-allowed',
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 2,
    },
  });
