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
  Alert,
} from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetProject, thunkPostProject, updateProjectData } from '../store/project/projectActions';
import { Project, ProjectData } from '../store/project/projectTypes';
import { State } from '../store/State';
import { formatDropdownValue } from '../util/formatDropdownValue';

export const PartIdentification: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error, data } = useSelector<State, Project>((state) => state.project);
  const {
    id: projectId,
    camera,
    location,
    parts,
    needRetraining,
    accuracyRangeMin,
    accuracyRangeMax,
    maxImages: maxImage,
  } = data;
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
  const [maxImgCountError, setMaxImgCountError] = useState(false);

  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      dispatch(thunkGetProject());
    }
  }, [dispatch, cameraLoading, locationLoading, partLoading]);

  useEffect(() => {
    if (location) setSelectedLocationById(location);
    if (parts.length) setSelectedPartsById(parts);
    if (camera) setSelectedCameraById(camera);
  }, [camera, location, parts, setSelectedCameraById, setSelectedLocationById, setSelectedPartsById]);

  const handleSubmitConfigure = (): void => {
    ((dispatch(
      thunkPostProject(projectId, selectedLocations, selectedParts, selectedCamera),
    ) as unknown) as Promise<number>)
      .then((id) => {
        if (typeof id !== 'undefined') history.push(`/cameras/detail?name=${selectedCamera.name}`);
        return void 0;
      })
      .catch((e) => e);
  };

  const setData = (keyName: keyof ProjectData, value: ProjectData[keyof ProjectData]): void => {
    dispatch(updateProjectData({ ...data, [keyName]: value }));
  };

  return (
    <>
      <Text size="larger" weight="semibold">
        Part Identification
      </Text>
      <Divider color="black" />
      {error && (
        <Alert danger header="Load Part Identification Error" content={`${error.name}: ${error.message}`} />
      )}
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
          onChange={(_, { checked }): void => setData('needRetraining', checked)}
        />
        <Text disabled={!needRetraining}>Accuracy Range</Text>
        <Text disabled={!needRetraining}>
          Minimum:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={accuracyRangeMin}
            onChange={(_, { value }): void => setData('accuracyRangeMin', value)}
          />
          %
        </Text>
        <Text disabled={!needRetraining}>
          Maximum:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={accuracyRangeMax}
            onChange={(_, { value }): void => setData('accuracyRangeMax', value)}
          />
          %
        </Text>
        <Text disabled={!needRetraining}>
          Maximum Images:{' '}
          <Input
            type="number"
            disabled={!needRetraining}
            inline
            value={maxImage}
            onChange={(_, { value }): void => {
              if ((value as any) < 15) setMaxImgCountError(true);
              else setMaxImgCountError(false);
              setData('maxImages', value);
            }}
          />
          {maxImgCountError && <Text error>Cannot be less than 15</Text>}
        </Text>
        <Link to="">Advanced Configuration</Link>
        <Button
          content="Configure"
          primary
          onClick={handleSubmitConfigure}
          disabled={!selectedCamera || !selectedLocations || !selectedParts || isLoading}
          loading={isLoading}
        />
      </Flex>
    </>
  );
};

// TODO Make this integrate with Redux
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
    if (data.value === null) setSelectedModuleItem((prev) => prev);
    else if (Array.isArray(data.value)) {
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
      <Dropdown
        items={items}
        onChange={onDropdownChange}
        value={formatDropdownValue(value)}
        multiple={isMultiple}
      />
      <Link to={to}>{`Add ${moduleName}`}</Link>
    </Flex>
  );
};
