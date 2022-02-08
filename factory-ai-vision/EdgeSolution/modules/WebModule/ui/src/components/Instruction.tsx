import React, { useState } from 'react';
import { Text, PrimaryButton, Stack, IconButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import * as R from 'ramda';

type InstructionProps = {
  title: string;
  subtitle: string;
  smallIcon?: boolean;
  button?: {
    text: string;
    to?: string;
    onClick?: () => void;
  };
  styles?: any;
};

export const Instruction: React.FC<InstructionProps> = ({
  title,
  subtitle,
  button,
  smallIcon,
  styles = {},
}) => {
  const [visible, setvisible] = useState(true);
  const history = useHistory();

  if (!visible) return null;

  return (
    <Stack
      styles={R.mergeDeepRight(
        {
          root: {
            background: '#F8FFF0',
            border: '1px solid #57A300',
            borderRadius: '2px',
            padding: '19px 7px',
            position: 'relative',
            margin: '24px 0px',
          },
        },
        styles,
      )}
      horizontal
    >
      <img src={smallIcon ? '/icons/instruction_icon_sm.svg' : '/icons/instruction_icon.svg'} alt="" />
      <Stack tokens={{ padding: 10 }}>
        <Text style={{ fontWeight: 600 }}>{title}</Text>
        <Text>{subtitle}</Text>
        <Stack.Item>
          {button && (
            <PrimaryButton
              text={button.text}
              styles={{ root: { marginTop: '15px' } }}
              onClick={() => {
                if (button.onClick) button.onClick();
                if (button.to) history.push(button.to);
              }}
            />
          )}
        </Stack.Item>
      </Stack>
      <IconButton
        iconProps={{ iconName: 'Cancel' }}
        styles={{ root: { position: 'absolute', fontSize: '8px', right: '8px', top: '8px' } }}
        onClick={() => setvisible(false)}
      />
    </Stack>
  );
};
