import React from 'react';
import { Button, Flex, AddIcon, ComponentEventHandler, ButtonProps } from '@fluentui/react-northstar';

export const CreateButton: React.FC<{ title: string; onClick: ComponentEventHandler<ButtonProps> }> = ({
  title,
  onClick,
}) => {
  return (
    <Flex hAlign="center" vAlign="center" column gap="gap.small">
      <Button
        fluid
        circular
        content={<AddIcon size="largest" circular color="brand" />}
        style={{ width: 100, height: 100, border: '5px solid #0094d8' }}
        color="brand"
        onClick={onClick}
      />
      <h2>{title}</h2>
    </Flex>
  );
};
