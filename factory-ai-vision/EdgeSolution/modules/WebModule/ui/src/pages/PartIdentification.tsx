import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ShorthandCollection,
} from '@fluentui/react-northstar';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import * as R from 'ramda';

import { thunkGetProject, thunkPostProject, updateProjectData } from '../store/project/projectActions';
import { Project, ProjectData } from '../store/project/projectTypes';
import { State } from '../store/State';
import { formatDropdownValue, Value } from '../util/formatDropdownValue';
import { getAppInsights } from '../TelemetryService';
import { WarningDialog } from '../components/WarningDialog';
import { AddCameraLink } from '../components/AddModuleDialog/AddCameraLink';
import { AddLocationLink } from '../components/AddModuleDialog/AddLocationLink';
import { AddPartLink } from '../components/AddModuleDialog/AddPartLink';
import { LabelImage } from '../store/image/imageTypes';
import { getLabelImages } from '../store/image/imageActions';

const sendTrainInfoToAppInsight = async (selectedParts): Promise<void> => {
  const { data: images } = await Axios.get('/api/images/');

  const selectedPartIds = selectedParts.map((e) => e.id);
  const interestedImagesLength = images.filter((e) => selectedPartIds.includes(e.part)).length;
  const appInsight = getAppInsights();
  if (appInsight)
    appInsight.trackEvent({
      name: 'train',
      properties: {
        images: interestedImagesLength,
        parts: selectedParts.length,
        source: '',
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
    sendMessageToCloud,
    framesPerMin,
    accuracyThreshold,
  } = data;
  const allImages = useSelector<State, LabelImage[]>((state) => state.images);
  const images = useMemo(() => allImages.filter((e) => !e.is_relabel), [allImages]);
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
  const [suggestMessage, setSuggestMessage] = useState({ min: 0, max: 0, partName: '', rangeMessage: '' });
  const hasUserUpdateAccuracyRange = useRef(false);

  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      dispatch(thunkGetProject(isTestModel));
    }
  }, [dispatch, cameraLoading, locationLoading, partLoading, isTestModel]);

  useEffect(() => {
    dispatch(getLabelImages());
  }, [dispatch]);

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
    dispatch(updateProjectData({ [keyName]: value }));
  };

  useEffect(() => {
    const partsWithImageLength = images.reduce((acc, cur) => {
      const { id } = cur.part;
      const relatedPartIdx = acc.findIndex((e) => e.id === id);
      if (relatedPartIdx >= 0) acc[relatedPartIdx].length = acc[relatedPartIdx].length + 1 || 1;
      return acc;
    }, R.clone(selectedParts));

    const minimumLengthPart = partsWithImageLength.reduce(
      (acc, cur) => {
        if (cur.length < acc.length) return { name: cur.name, length: cur.length };
        return acc;
      },
      { name: '', length: Infinity },
    );

    if (minimumLengthPart.length === Infinity) return;
    if (minimumLengthPart.length < 30) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 40, accuracyRangeMin: 10 }));
      setSuggestMessage({
        min: 10,
        max: 40,
        partName: minimumLengthPart.name,
        rangeMessage: 'lower than 30',
      });
    } else if (minimumLengthPart.length >= 30 && minimumLengthPart.length < 80) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 60, accuracyRangeMin: 30 }));
      setSuggestMessage({
        min: 30,
        max: 60,
        partName: minimumLengthPart.name,
        rangeMessage: 'between 30 to 80',
      });
    } else if (minimumLengthPart.length >= 80 && minimumLengthPart.length < 130) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 80, accuracyRangeMin: 50 }));
      setSuggestMessage({
        min: 50,
        max: 80,
        partName: minimumLengthPart.name,
        rangeMessage: 'between 80 to 130',
      });
    } else if (minimumLengthPart.length >= 130) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 90, accuracyRangeMin: 60 }));
      setSuggestMessage({
        min: 60,
        max: 90,
        partName: minimumLengthPart.name,
        rangeMessage: 'more than 130',
      });
    }
  }, [accuracyRangeMin, dispatch, images, selectedParts]);

  const accracyRangeDisabled = !needRetraining || isTestModel;
  const messageToCloudDisabled = !sendMessageToCloud;

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
          moduleName="camera"
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
          moduleName="location"
          to="/locations"
          value={selectedLocations}
          setSelectedModuleItem={setSelectedLocationById}
          items={dropDownLocations}
          isMultiple={false}
          isTestModel={isTestModel}
        />
        <Flex gap="gap.large">
          <Flex column gap="gap.medium">
            <Checkbox
              label="Set up retraining"
              checked={needRetraining}
              onChange={(_, { checked }): void => setData('needRetraining', checked)}
              disabled={isTestModel}
            />
            <Text disabled={accracyRangeDisabled}>Capture Image</Text>
            <Text disabled={accracyRangeDisabled}>
              Minimum:{' '}
              <Input
                type="number"
                disabled={accracyRangeDisabled}
                inline
                value={accuracyRangeMin}
                onChange={(_, { value }): void => {
                  if (!hasUserUpdateAccuracyRange.current) hasUserUpdateAccuracyRange.current = true;
                  setData('accuracyRangeMin', value);
                }}
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
                onChange={(_, { value }): void => {
                  if (!hasUserUpdateAccuracyRange.current) hasUserUpdateAccuracyRange.current = true;
                  setData('accuracyRangeMax', value);
                }}
              />
              %
            </Text>
            <Text styles={{ fontSize: '12px' }} success>
              {`The Part ${suggestMessage.partName} contains images ${suggestMessage.rangeMessage}, recommend to set the range to Min ${suggestMessage.min}% and Max ${suggestMessage.max}% `}
            </Text>
            <Text disabled={accracyRangeDisabled}>
              Maximum Images to Store:{' '}
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
          </Flex>
          <Flex column gap="gap.medium">
            <Checkbox
              label="Send message to cloud"
              checked={sendMessageToCloud}
              onChange={(_, { checked }): void => setData('sendMessageToCloud', checked)}
            />
            <Text disabled={messageToCloudDisabled}>
              Frames per minute:{' '}
              <Input
                type="number"
                disabled={messageToCloudDisabled}
                inline
                value={framesPerMin}
                onChange={(_, { value }): void => setData('framesPerMin', value)}
              />
            </Text>
            <Text disabled={messageToCloudDisabled}>
              Accuracy threshold:{' '}
              <Input
                type="number"
                disabled={messageToCloudDisabled}
                inline
                value={accuracyThreshold}
                onChange={(_, { value }): void => setData('accuracyThreshold', value)}
              />
            </Text>
          </Flex>
        </Flex>
        <Flex gap="gap.large">
          <Button
            content="Configure"
            primary
            onClick={handleSubmitConfigure}
            disabled={(!selectedCamera || !selectedLocations || !selectedParts || isLoading) && !isTestModel}
            loading={isLoading}
          />
          <TestModelButton isTestModel={isTestModel} setIsTestModel={setIsTestModel} />
        </Flex>
      </Flex>
    </>
  );
};

const TestModelButton = ({ isTestModel, setIsTestModel }): JSX.Element => {
  if (isTestModel) {
    return <Button content="Back" onClick={(): void => setIsTestModel(false)} primary />;
  }

  return (
    <WarningDialog
      confirmButton="Confirm"
      onConfirm={(): void => setIsTestModel(true)}
      contentText={
        <>
          <p>
            &quot;Demo Pretrained Detection&quot; is for seeing inference result, no retraining experience
            here.
          </p>
          <p>For retraining experience, please create a new model</p>
        </>
      }
      trigger={<Button content="Demo Pretrained Detection" primary />}
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
    const url =
      moduleName === 'cameras' && isTestModel
        ? `/api/${moduleName}/`
        : `/api/${moduleName}/?is_demo=${Number(isTestModel)}`;
    setLoading(true);
    Axios(url)
      .then(({ data }) => {
        if (data.length === 0) {
          setDropDownItems([
            {
              header: `No ${moduleName.replace('s', '')} found, please add ${moduleName.replace('s', '')}`,
              content: {
                key: 'Dummy',
              },
            },
          ]);
        } else {
          setDropDownItems(
            data.map((e) => ({
              header: e.name,
              content: {
                key: e.id,
              },
            })),
          );
        }
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

  const getAddModuleLink = (): JSX.Element => {
    switch (moduleName) {
      case 'camera':
        return <AddCameraLink />;
      case 'location':
        return <AddLocationLink />;
      case 'parts':
        return <AddPartLink />;
      default:
        return <p>Un supported module</p>;
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
      {getAddModuleLink()}
    </Flex>
  );
};
