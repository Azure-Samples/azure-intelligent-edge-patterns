import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Divider, Text, Flex, Dropdown, Button, DropdownItemProps } from '@fluentui/react-northstar';
import { Link } from 'react-router-dom';

export const PartIdentification: React.FC = () => {
  const [cameraLoading, dropDownCameras, selectedCamera, setSelectedCameraById] = useDropdownItems<any>(
    'cameras',
  );
  const [partLoading, dropDownParts, selectedParts, setSelectedPartsById] = useDropdownItems<any>('parts');
  const [locationLoading, dropDownLocations, selectedLocations, setSelectedLocationById] = useDropdownItems<
    any
  >('locations');

  const projectId = useRef<number>(null);
  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      fetch('/api/projects/')
        .then((res) => res.json())
        .then((data) => {
          if (data.length > 0) {
            projectId.current = data[0].id;
            setSelectedLocationById(data[0].location.split('/')[5]);
            setSelectedPartsById(data[0].parts[0].split('/')[5]);
          }
          return void 0;
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [cameraLoading, locationLoading, partLoading, setSelectedLocationById, setSelectedPartsById]);

  const handleSubmitConfigure = (): void => {
    const isProjectEmpty = projectId.current === null;
    const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId.current}/`;

    fetch(url, {
      body: JSON.stringify({
        location: `http://localhost:8000/api/locations/${selectedLocations.id}/`,
        parts: [`http://localhost:8000/api/parts/${selectedParts.id}/`],
      }),
      method: isProjectEmpty ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  return (
    <>
      <Text size="larger" weight="semibold">
        Part Identification
      </Text>
      <Divider color="black" />
      <Flex column gap="gap.large" design={{ paddingTop: '30px' }}>
        <ModuleSelector
          moduleName="cameras"
          to="/cameras"
          value={selectedCamera?.name}
          setSelectedModuleItem={setSelectedCameraById}
          items={dropDownCameras}
        />
        <ModuleSelector
          moduleName="parts"
          to="/parts"
          value={selectedParts?.name}
          setSelectedModuleItem={setSelectedPartsById}
          items={dropDownParts}
        />
        <ModuleSelector
          moduleName="locations"
          to="/locations"
          value={selectedLocations?.name}
          setSelectedModuleItem={setSelectedLocationById}
          items={dropDownLocations}
        />
        <Link to="">Advanced Configuration</Link>
        <Button primary onClick={handleSubmitConfigure}>
          Configure
        </Button>
      </Flex>
    </>
  );
};

function useDropdownItems<T>(moduleName: string): [boolean, DropdownItemProps[], T, (id: string) => void] {
  const originItems = useRef<(T & { id: number })[]>([]);
  const [dropDownItems, setDropDownItems] = useState<DropdownItemProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<T>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/${moduleName}/`)
      .then((res) => res.json())
      .then((data) => {
        setDropDownItems(
          data.map((e) => ({
            header: e.name,
            content: {
              key: e.id,
            },
          })),
        );
        originItems.current = data;
        setLoading(false);
        return void 0;
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
      });
  }, [moduleName]);

  const setSelectedItemById = useCallback((id: string): void => {
    const correspondedItem = originItems.current.find((ele) => ele.id.toString(10) === id.toString());
    if (correspondedItem) setSelectedItem(correspondedItem);
  }, []);

  return [loading, dropDownItems, selectedItem, setSelectedItemById];
}

const ModuleSelector = ({ moduleName, to, value, setSelectedModuleItem, items }): JSX.Element => {
  const onDropdownChange = (_, data): void => {
    const { key } = data.value.content;
    setSelectedModuleItem(key);
  };

  return (
    <Flex vAlign="center" gap="gap.medium">
      <Text styles={{ width: '150px' }}>{`Select ${moduleName}`}</Text>
      <Dropdown items={items} onChange={onDropdownChange} value={value} />
      <Link to={to}>{`Add ${moduleName}`}</Link>
    </Flex>
  );
};
