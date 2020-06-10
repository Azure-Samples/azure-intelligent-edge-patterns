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
  Dialog,
  ExclamationCircleIcon,
  ShorthandCollection,
} from '@fluentui/react-northstar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { thunkGetProject, thunkPostProject, updateProjectData } from '../store/project/projectActions';
import { Project, ProjectData } from '../store/project/projectTypes';
import { State } from '../store/State';
import { formatDropdownValue, Value } from '../util/formatDropdownValue';
import { getIdFromUrl } from '../util/GetIDFromUrl';
import { getAppInsights } from '../TelemetryService';

const sendTrainInfoToAppInsight = async (selectedParts): Promise<void> => {
  const { data: images } = await Axios.get('/api/images/');

  const selectedPartIds = selectedParts.map((e) => e.id);
  const interestedImagesLength = images.filter((e) => selectedPartIds.includes(getIdFromUrl(e.part))).length;
  const appInsight = getAppInsights();
  if (appInsight)
    appInsight.trackEvent({
      name: 'train',
      properties: {
        images: interestedImagesLength,
        parts: selectedParts.length,
        source: window.location.hostname,
      },
    });
};

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
  const [isTestModel, setIsTestModel] = useState(false);
  const [cameraLoading, dropDownCameras, selectedCamera, setSelectedCameraById] = useDropdownItems<any>(
    'cameras',
    isTestModel,
  );
  const [partLoading, dropDownParts, selectedParts, setSelectedPartsById] = useDropdownItems<any>(
    'parts',
    isTestModel,
    true,
  );
  const [locationLoading, dropDownLocations, selectedLocations, setSelectedLocationById] = useDropdownItems<
    any
  >('locations', isTestModel);
  const history = useHistory();
  const [maxImgCountError, setMaxImgCountError] = useState(false);

  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      dispatch(thunkGetProject(isTestModel));
    }
  }, [dispatch, cameraLoading, locationLoading, partLoading, isTestModel]);

  useEffect(() => {
    if (!isTestModel) {
      if (location) setSelectedLocationById(location);
      if (parts.length) setSelectedPartsById(parts);
      if (camera) setSelectedCameraById(camera);
    }
  }, [
    camera,
    isTestModel,
    location,
    parts,
    setSelectedCameraById,
    setSelectedLocationById,
    setSelectedPartsById,
  ]);

  const handleSubmitConfigure = async (): Promise<void> => {
    try {
      if (!isTestModel) sendTrainInfoToAppInsight(selectedParts);

      const id = await dispatch(
        thunkPostProject(projectId, selectedLocations, selectedParts, selectedCamera, isTestModel),
      );

      if (typeof id !== 'undefined')
        history.push(`/cameras/detail?name=${selectedCamera.name}&isDemo=${isTestModel}`);
    } catch (e) {
      alert(e);
    }
  };

  const setData = (keyName: keyof ProjectData, value: ProjectData[keyof ProjectData]): void => {
    dispatch(updateProjectData({ ...data, [keyName]: value }));
  };

  const accracyRangeDisabled = !needRetraining || isTestModel;

  return (
    <>
      <Text size="larger" weight="semibold">
        Part Identification
      </Text>
      <Divider color="black" />
      {error && (
        <Alert danger header="Load Part Identification Error" content={`${error.name}: ${error.message}`} />
      )}
      <TestModelButton isTestModel={isTestModel} setIsTestModel={setIsTestModel} />
      <Flex column gap="gap.large" design={{ paddingTop: '30px' }}>
        <ModuleSelector
          moduleName="cameras"
          to="/cameras"
          value={selectedCamera}
          setSelectedModuleItem={setSelectedCameraById}
          items={dropDownCameras}
          isMultiple={false}
          isTestModel={isTestModel}
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
          isTestModel={isTestModel}
        />
        <Checkbox
          label="Set up retraining"
          checked={needRetraining}
          onChange={(_, { checked }): void => setData('needRetraining', checked)}
          disabled={isTestModel}
        />
        <Text disabled={accracyRangeDisabled}>Accuracy Range</Text>
        <Text disabled={accracyRangeDisabled}>
          Minimum:{' '}
          <Input
            type="number"
            disabled={accracyRangeDisabled}
            inline
            value={accuracyRangeMin}
            onChange={(_, { value }): void => setData('accuracyRangeMin', value)}
          />
          %
        </Text>
        <Text disabled={accracyRangeDisabled}>
          Maximum:{' '}
          <Input
            type="number"
            disabled={accracyRangeDisabled}
            inline
            value={accuracyRangeMax}
            onChange={(_, { value }): void => setData('accuracyRangeMax', value)}
          />
          %
        </Text>
        <Text disabled={accracyRangeDisabled}>
          Maximum Images:{' '}
          <Input
            type="number"
            disabled={accracyRangeDisabled}
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
          disabled={(!selectedCamera || !selectedLocations || !selectedParts || isLoading) && !isTestModel}
          loading={isLoading}
        />
      </Flex>
    </>
  );
};

const TestModelButton = ({ isTestModel, setIsTestModel }): JSX.Element => {
  if (isTestModel) {
    return (
      <Button
        styles={{
          backgroundColor: '#ff9727',
          ':hover': {
            backgroundColor: '#cf7a1f',
          },
          ':active': {
            backgroundColor: '#cf7a1f',
          },
        }}
        content="Back"
        onClick={(): void => setIsTestModel(false)}
        primary
      />
    );
  }

  return (
    <Dialog
      styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      cancelButton="Cancel"
      confirmButton="Confirm to use test model"
      onConfirm={(): void => setIsTestModel(true)}
      content={
        <>
          <Flex hAlign="center" column>
            <ExclamationCircleIcon
              size="largest"
              styles={({ theme: { siteVariables } }): any => ({
                color: siteVariables.colorScheme.brand.foreground,
              })}
            />
            <div>
              <p>Test model is for seeing inference result, no retraining experience here.</p>
              <p>For retraining experience, please create a new model</p>
            </div>
          </Flex>
        </>
      }
      trigger={
        <Button
          styles={{
            backgroundColor: '#ff9727',
            ':hover': {
              backgroundColor: '#cf7a1f',
            },
            ':active': {
              backgroundColor: '#cf7a1f',
            },
          }}
          content="Test Model"
          primary
        />
      }
    />
  );
};

// TODO Make this integrate with Redux
function useDropdownItems<T>(
  moduleName: string,
  isTestModel: boolean,
  isMultiple?: boolean,
): [boolean, DropdownItemProps[], T | T[], (id: string | string[]) => void] {
  const originItems = useRef<(T & { id: number })[]>([]);
  const [dropDownItems, setDropDownItems] = useState<DropdownItemProps[]>([]);
  const [selectedItem, setSelectedItem] = useState<T | T[]>(isMultiple ? [] : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Axios(`/api/${moduleName}/?is_demo=${Number(isTestModel)}`)
      .then(({ data }) => {
        setDropDownItems(
          data.map((e) => ({
            header: e.name,
            content: {
              key: e.id,
            },
          })),
        );
        originItems.current = data;
        if (isMultiple) {
          setSelectedItem(data);
        } else {
          setSelectedItem(data[0]);
        }
        setLoading(false);
        return void 0;
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isMultiple, moduleName, isTestModel]);

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

/* Module Selector */

type ModuleSelectorProps = {
  moduleName: string;
  to: string;
  value: Value;
  setSelectedModuleItem: (id: string | string[]) => void;
  items: ShorthandCollection<DropdownItemProps>;
  isMultiple: boolean;
  isTestModel?: boolean;
};

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  moduleName,
  to,
  value,
  setSelectedModuleItem,
  items,
  isMultiple,
  isTestModel,
}): JSX.Element => {
  const onDropdownChange = (_, data): void => {
    if (data.value === null) return;
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
      {isTestModel ? (
        <Dropdown items={items} value={formatDropdownValue(value)} multiple={isMultiple} open={false} />
      ) : (
        <Dropdown
          items={items}
          onChange={onDropdownChange}
          value={formatDropdownValue(value)}
          multiple={isMultiple}
        />
      )}
      <Link to={to}>{`Add ${moduleName}`}</Link>
    </Flex>
  );
};
