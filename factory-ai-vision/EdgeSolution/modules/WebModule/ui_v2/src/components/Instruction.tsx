import React, { useState } from 'react';
import { Text, PrimaryButton, Stack, IconButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

type InstructionProps = {
  title: string;
  subtitle: string;
  smallIcon?: boolean;
  button?: {
    text: string;
    to: string;
  };
};

export const Instruction: React.FC<InstructionProps> = ({ title, subtitle, button, smallIcon }) => {
  const [visible, setvisible] = useState(true);
  const history = useHistory();

  if (!visible) return null;

  return (
    <Stack
      styles={{
        root: {
          background: '#F8FFF0',
          border: '1px solid #57A300',
          borderRadius: '2px',
          padding: '19px 7px',
          position: 'relative',
          margin: '24px 0px',
        },
      }}
      horizontal
    >
      <img src={smallIcon ? '/icons/instruction_icon_sm.svg' : '/icons/instruction_icon.svg'} />
      <Stack tokens={{ padding: 10 }}>
        <Text style={{ fontWeight: 600 }}>{title}</Text>
        <Text>{subtitle}</Text>
        <Stack.Item>
          {button && (
            <PrimaryButton
              text={button.text}
              styles={{ root: { marginTop: '15px' } }}
              onClick={() => history.push(button.to)}
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
