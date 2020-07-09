import React from 'react';
import { RadioGroup } from '@fluentui/react-northstar';
import { useParts } from '../../hooks/useParts';
import { useProject } from '../../hooks/useProject';

type PartFormProps = {
  top: number;
  left: number;
  open: boolean;
};

export const PartForm: React.FC<PartFormProps> = ({ top, left, open }) => {
  const parts = useParts();
  const project = useProject();

  const items = project.data.parts
    .map((e) => parts.find((part) => part.id === e))
    .filter((e) => e !== undefined)
    .map((e) => ({
      name: e.name,
      key: e.id,
      label: e.name,
      value: e.id,
    }));

  if (!open) return null;

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: 'rgb(187, 187, 187) 0px 2px 8px',
        border: '1px solid rgba(34,36,38,.15)',
        borderRadius: '5px',
        top,
        left,
      }}
    >
      <RadioGroup
        vertical
        items={items}
        onCheckedValueChange={(_, newProps) => console.log(newProps.value)}
      />
    </div>
  );
};
