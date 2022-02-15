import { mergeStyleSets } from '@fluentui/react';

import { theme } from '../../../constant';

export const getFlowClasses = () =>
  mergeStyleSets({
    flow: {
      '.react-flow__handle': {
        height: '11px',
        width: '11px',
      },
      '.react-flow__handle-top': {
        top: '-7px',
      },
      '.react-flow__handle-bottom': {
        bottom: '-7px',
      },
      '.react-flow__handle-connecting': {
        background: theme.palette.red,
        ':hover': {
          height: '15px',
          width: '15px',
          bottom: '-9px',
        },
      },
      '.react-flow__handle-valid': {
        background: theme.palette.greenLight,
        ':hover': {
          height: '15px',
          width: '15px',
          bottom: '-9px',
        },
      },
      '.edgebutton-foreignobject body': {
        alignItems: 'center',
        background: 'transparent',
        display: 'flex',
        height: '40px',
        justifyContent: 'center',
        minHeight: '40px',
        width: '40px',
      },
      '.edgebutton': {
        color: '#555',
        background: '#FFF',
        border: '1px solid #EEE',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '12px',
        height: '20px',
        lineHeight: '1',
        width: '20px',
        ':hover': {
          boxShadow: '0 0 6px 2px rgb(0 0 0 / 8%)',
          transform: 'scale(1.1)',
        },
      },
    },
  });
