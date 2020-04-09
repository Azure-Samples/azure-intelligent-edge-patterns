import React from 'react';
import { Divider, Text, Flex, Dropdown, Button, DropdownItemProps } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';
import { useCameras } from '../hooks/useCameras';
import { useParts } from '../hooks/useParts';

export const PartIdentification: React.FC = () => {
  const availableCameras = useCameras();
  const cameraItems: DropdownItemProps[] = availableCameras.map((ele) => ({
    header: ele.name,
    content: {
      key: ele.id,
    },
  }));

  const availableParts = useParts();
  const partItems: DropdownItemProps[] = availableParts.map((ele) => ({
    header: ele.name,
    content: {
      key: ele.id,
    },
  }));

  return (
    <>
      <Text size="larger" weight="semibold">
        Part Identification
      </Text>
      <Divider color="black" />
      <Flex column gap="gap.large" design={{ paddingTop: '30px' }}>
        <ModuleSelector moduleName="Camera" to="" items={cameraItems} />
        <ModuleSelector moduleName="Part" to="" items={partItems} />
        <ModuleSelector moduleName="Location" to="" items={[]} />
        <Link to="">Advanced Configuration</Link>
        <Button primary>Configure</Button>
      </Flex>
    </>
  );
};

const ModuleSelector = ({ moduleName, to, items }): JSX.Element => {
  return (
    <Flex vAlign="center" gap="gap.medium">
      <Text styles={{ width: '150px' }}>{`Select ${moduleName}`}</Text>
      <Dropdown items={items} />
      <Link to={to}>{`Add ${moduleName}`}</Link>
    </Flex>
  );
};
