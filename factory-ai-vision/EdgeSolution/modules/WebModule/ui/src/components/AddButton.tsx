import React, { FC } from 'react';
import { Button, AddIcon } from '@fluentui/react-northstar';

interface AddButtonProps {
  onClick?: () => void;
}
const AddButton: FC<AddButtonProps> = ({ onClick }) => (
  <Button
    primary
    fluid
    circular
    content={<AddIcon size="largest" circular />}
    styles={{ width: '6em', height: '6em' }}
    onClick={onClick}
  />
);

export default AddButton;
