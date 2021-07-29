import React from 'react';
import { Icon, Stack } from '@fluentui/react';

interface Props {
  id: number;
  text: string;
  isDelete?: boolean;
  onDelete?: (id: number) => void;
}

const Tag: React.FC<Props> = (props) => {
  const { id, text, isDelete, onDelete } = props;

  return (
    <Stack
      style={{
        backgroundColor: '#E7EFFF',
        fontSize: '14px',
        lineHeight: '20px',
        padding: '8px 4px',
        borderRadius: '2px',
      }}
      horizontal
    >
      {text}
      {isDelete && (
        <Icon styles={{ root: { marginLeft: '8px' } }} iconName="Cancel" onClick={() => onDelete(id)} />
      )}
    </Stack>
  );
};

export default Tag;
