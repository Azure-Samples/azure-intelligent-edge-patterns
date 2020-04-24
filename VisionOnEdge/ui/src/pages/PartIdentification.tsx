import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Divider,
  Text,
  Flex,
  Dropdown,
  Button,
  DropdownItemProps,
  Checkbox,
  Input,
} from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetProject } from '../store/project/projectActions';
import { Project } from '../store/project/projectTypes';
import { State } from '../store/State';

export const PartIdentification: React.FC = () => {
  const dispatch = useDispatch();
  const { id, camera, location, parts } = useSelector<State, Project>((state) => state.project);
  const [cameraLoading, dropDownCameras, selectedCamera, setSelectedCameraById] = useDropdownItems<any>(
    'cameras',
  );
  const [partLoading, dropDownParts, selectedParts, setSelectedPartsById] = useDropdownItems<any>(
    'parts',
    true,
  );
  const [locationLoading, dropDownLocations, selectedLocations, setSelectedLocationById] = useDropdownItems<
    any
  >('locations');
  const history = useHistory();
  const [needRetraining, setNeedRetraining] = useState(true);
  const [max, setMax] = useState(80);
  const [min, setMin] = useState(60);
  const [maxImgCount, setMaxImgCount] = useState(15);
  const [maxImgCountError, setMaxImgCountError] = useState(false);

  const projectId = useRef<number>(null);
  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      dispatch(thunkGetProject());
    }
  }, [dispatch, cameraLoading, locationLoading, partLoading]);

  useEffect(() => {
    projectId.current = id;
    if (location) setSelectedLocationById(location.split('/')[5]);
    if (parts.length) setSelectedPartsById(parts.map((ele) => ele.split('/')[5]));
    if (camera) setSelectedCameraById(camera.split('/')[5]);
  }, [camera, id, location, parts, setSelectedCameraById, setSelectedLocationById, setSelectedPartsById]);

  const handleSubmitConfigure = (): void => {
    const isProjectEmpty = projectId.current === null;
    const url = isProjectEmpty ? `/api/projects/` : `/api/projects/${projectId.current}/`;

    fetch(url, {
      body: JSON.stringify({
        location: `http://localhost:8000/api/locations/${selectedLocations.id}/`,
        parts: selectedParts.map((e) => `http://localhost:8000/api/parts/${e.id}/`),
        camera: `http://localhost:8000/api/cameras/${selectedCamera.id}/`,
        download_uri: '',
      }),
      method: isProjectEmpty ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => {
        history.push(`/cameras/${selectedCamera.name}/${projectId.current}`);
        return void 0;
      })
      .catch((err) => {
        console.error(err);
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
          value={selectedCamera}
          setSelectedModuleItem={setSelectedCameraById}
          items={dropDownCameras}
          isMultiple={false}
        />
        <ModuleSelector
          moduleName="parts"
          to="/parts"
          value={selectedParts}
          setSelectedModuleItem={setSelectedPartsById}
          items={dropDownParts}
          isMultiple={true}
        />
        <ModuleSelector
          moduleName="locations"
          to="/locations"
          value={selectedLocations}
          setSelectedModuleItem={setSelectedLocationById}
          items={dropDownLocations}
          isMultiple={false}
        />
        <Checkbox
          label="Set up retraining"
          checked={needRetraining}
          onChange={(_, data): void => setNeedRetraining(data.checked)}
        />
        <Text disabled={!needRetraining}>Accuracy Range</Text>
        <Text disabled={!needRetraining}>
          Minimum:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={min}
            onChange={(_, { value }): void => setMin(value as any)}
          />
          %
        </Text>
        <Text disabled={!needRetraining}>
          Maximum:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={max}
            onChange={(_, { value }): void => setMax(value as any)}
          />
          %
        </Text>
        <Text disabled={!needRetraining}>
          Maximum Images:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={maxImgCount}
            onChange={(_, { value }): void => {
              if ((value as any) < 15) setMaxImgCountError(true);
              else setMaxImgCountError(false);
              setMaxImgCount(value as any);
            }}
          />
          {maxImgCountError && <Text error>Cannot be less than 15</Text>}
        </Text>
        <Link to="">Advanced Configuration</Link>
        <Button
          primary
          onClick={handleSubmitConfigure}
          disabled={!selectedCamera || !selectedLocations || !selectedParts}
        >
          Configure
        </Button>
      </Flex>
    </>
  );
};

function useDropdownItems<T>(
  moduleName: string,
  isMultiple?: boolean,
): [boolean, DropdownItemProps[], T | T[], (id: string | string[]) => void] {
  const originItems = useRef<(T & { id: number })[]>([]);
  const [dropDownItems, setDropDownItems] = useState<DropdownItemProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | T[]>(isMultiple ? [] : null);
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

  const setSelectedItemById = useCallback((id: string | string[]): void => {
    if (Array.isArray(id)) {
      const correspondedItems = id.reduce((acc, cur) => {
        const correspondedItem = originItems.current.find((ele) => ele.id.toString(10) === cur.toString());
        if (correspondedItem) acc.push(correspondedItem);
        return acc;
      }, []);
      setSelectedItem(correspondedItems as any);
    } else {
      const correspondedItem = originItems.current.find((ele) => ele.id.toString(10) === id.toString());
      if (correspondedItem) setSelectedItem(correspondedItem);
    }
  }, []);

  return [loading, dropDownItems, selectedItem, setSelectedItemById];
}

const ModuleSelector = ({ moduleName, to, value, setSelectedModuleItem, items, isMultiple }): JSX.Element => {
  const onDropdownChange = (_, data): void => {
    if (Array.isArray(data.value)) {
      const ids = data.value.map((ele) => ele.content.key);
      setSelectedModuleItem(ids);
    } else {
      const { key } = data.value.content;
      setSelectedModuleItem(key);
    }
  };

  return (
    <Flex vAlign="center" gap="gap.medium">
      <Text styles={{ width: '150px' }}>{`Select ${moduleName}`}</Text>
      <Dropdown items={items} onChange={onDropdownChange} value={formatValue(value)} multiple={isMultiple} />
      <Link to={to}>{`Add ${moduleName}`}</Link>
    </Flex>
  );
};

const formatValue = (value): DropdownItemProps | DropdownItemProps[] => {
  if (Array.isArray(value)) {
    return value.map((e) => ({
      header: e.name,
      content: {
        key: e.id,
      },
    }));
  }
  if (value) {
    return {
      header: value.name,
      content: {
        key: value.id,
      },
    };
  }
  return null;
};
