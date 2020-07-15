import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Divider,
  Text,
  Flex,
  Dropdown,
  DropdownItemProps,
  Checkbox,
  Input,
  Alert,
  ShorthandCollection,
} from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import * as R from 'ramda';

import {
  thunkGetProject,
  thunkPostProject,
  updateProjectData,
  changeStatus,
  thunkUpdateAccuracyRange,
} from '../../store/project/projectActions';
import { Project, ProjectData, Status } from '../../store/project/projectTypes';
import { State } from '../../store/State';
import { formatDropdownValue, Value } from '../../util/formatDropdownValue';
import { getAppInsights } from '../../TelemetryService';
import { AddCameraLink } from '../AddModuleDialog/AddCameraLink';
import { AddLocationLink } from '../AddModuleDialog/AddLocationLink';
import { AddPartLink } from '../AddModuleDialog/AddPartLink';
import { LabelImage } from '../../store/image/imageTypes';
import { Button } from '../Button';
import { useQuery } from '../../hooks/useQuery';
import { WarningDialog } from '../WarningDialog';

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

export const ProjectConfig: React.FC<{ isDemo: boolean }> = ({ isDemo }) => {
  const dispatch = useDispatch();
  const cameraId = useQuery().get('cameraId');
  const { isLoading, error, data, status } = useSelector<State, Project>((state) =>
    isDemo ? state.demoProject : state.project,
  );
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
  const [cameraLoading, dropDownCameras, selectedCamera, setSelectedCameraById] = useDropdownItems<any>(
    'cameras',
    isDemo,
    false,
    cameraId === null ? undefined : parseInt(cameraId, 10),
  );
  const [partLoading, dropDownParts, selectedParts, setSelectedPartsById] = useDropdownItems<any>(
    'parts',
    isDemo,
    true,
  );
  const [locationLoading, dropDownLocations, selectedLocations, setSelectedLocationById] = useDropdownItems<
    any
  >('locations', isDemo);
  const [maxImgCountError, setMaxImgCountError] = useState(false);
  const [suggestMessage, setSuggestMessage] = useState({ min: 0, max: 0, partName: '', rangeMessage: '' });
  const hasUserUpdateAccuracyRange = useRef(false);

  useEffect(() => {
    if (!cameraLoading && !partLoading && !locationLoading) {
      dispatch(thunkGetProject(isDemo));
    }
  }, [dispatch, cameraLoading, locationLoading, partLoading, isDemo]);

  useEffect(() => {
    if (!isDemo) {
      if (location) setSelectedLocationById(location);
      if (parts.length) setSelectedPartsById(parts);
      if (camera && cameraId !== null) setSelectedCameraById(camera);
    }
  }, [
    camera,
    isDemo,
    location,
    parts,
    setSelectedCameraById,
    setSelectedLocationById,
    setSelectedPartsById,
    cameraId,
  ]);

  const handleSubmitConfigure = async (): Promise<void> => {
    try {
      if (!isDemo) sendTrainInfoToAppInsight(selectedParts);

      const id = await dispatch(
        thunkPostProject(projectId, selectedLocations, selectedParts, selectedCamera, isDemo),
      );

      if (typeof id !== 'undefined') {
        // Set the opposite project state to None so entering the opposite page won't see the stream
        dispatch(changeStatus(Status.WaitTraining, isDemo));
        dispatch(changeStatus(Status.None, !isDemo));
      }
    } catch (e) {
      alert(e);
    }
  };

  const setData = (keyName: keyof ProjectData, value: ProjectData[keyof ProjectData]): void => {
    dispatch(updateProjectData({ [keyName]: value }, isDemo));
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
        dispatch(updateProjectData({ accuracyRangeMax: 40, accuracyRangeMin: 10 }, isDemo));
      setSuggestMessage({
        min: 10,
        max: 40,
        partName: minimumLengthPart.name,
        rangeMessage: 'lower than 30',
      });
    } else if (minimumLengthPart.length >= 30 && minimumLengthPart.length < 80) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 60, accuracyRangeMin: 30 }, isDemo));
      setSuggestMessage({
        min: 30,
        max: 60,
        partName: minimumLengthPart.name,
        rangeMessage: 'between 30 to 80',
      });
    } else if (minimumLengthPart.length >= 80 && minimumLengthPart.length < 130) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 80, accuracyRangeMin: 50 }, isDemo));
      setSuggestMessage({
        min: 50,
        max: 80,
        partName: minimumLengthPart.name,
        rangeMessage: 'between 80 to 130',
      });
    } else if (minimumLengthPart.length >= 130) {
      if (!hasUserUpdateAccuracyRange.current)
        dispatch(updateProjectData({ accuracyRangeMax: 90, accuracyRangeMin: 60 }, isDemo));
      setSuggestMessage({
        min: 60,
        max: 90,
        partName: minimumLengthPart.name,
        rangeMessage: 'more than 130',
      });
    }
  }, [accuracyRangeMin, dispatch, images, isDemo, selectedParts]);

  const accracyRangeDisabled = !needRetraining || isDemo;
  const messageToCloudDisabled = !sendMessageToCloud;

  return (
    <Flex hAlign="center" styles={{ width: '600px' }} column gap="gap.medium">
      <Text size="larger" weight="semibold">
        {isDemo ? 'Demo Model' : 'Part Identification'}
      </Text>
      <Divider color="black" styles={{ width: '100%' }} />
      {error && (
        <Alert danger header="Load Part Identification Error" content={`${error.name}: ${error.message}`} />
      )}
      <Flex column gap="gap.small">
        {/* TODO: Get the actual model from backend */}
        {isDemo && (
          <ModuleSelector
            moduleName="model"
            setSelectedModuleItem={() => {}}
            items={[
              {
                header: `yolov3_PascalVoc`,
                content: {
                  key: 'demo1',
                },
              },
            ]}
            isMultiple={false}
            isDemo={isDemo}
          />
        )}
        <ModuleSelector
          moduleName="camera"
          value={selectedCamera}
          setSelectedModuleItem={setSelectedCameraById}
          items={dropDownCameras}
          isMultiple={false}
          isDemo={isDemo}
        />
        <ModuleSelector
          moduleName="parts"
          value={selectedParts}
          setSelectedModuleItem={setSelectedPartsById}
          items={dropDownParts}
          isMultiple={true}
          isDemo={isDemo}
        />
        <ModuleSelector
          moduleName="location"
          value={selectedLocations}
          setSelectedModuleItem={setSelectedLocationById}
          items={dropDownLocations}
          isMultiple={false}
          isDemo={isDemo}
          block={isDemo}
        />
      </Flex>
      <Flex styles={{ height: '250px' }}>
        {!isDemo && (
          <>
            <Flex column gap="gap.medium" styles={{ width: '50%' }}>
              <Checkbox
                label="Set up retraining"
                checked={needRetraining}
                onChange={(_, { checked }): void => setData('needRetraining', checked)}
                disabled={isDemo}
              />
              <Text disabled={accracyRangeDisabled} weight="bold">
                Accuracy range to capture images
              </Text>
              <Flex gap="gap.small">
                <Flex column hAlign="center">
                  <Text disabled={accracyRangeDisabled} content="Minimum: " />
                  <Input
                    type="number"
                    disabled={accracyRangeDisabled}
                    inline
                    value={accuracyRangeMin}
                    onChange={(_, { value }): void => {
                      if (!hasUserUpdateAccuracyRange.current) hasUserUpdateAccuracyRange.current = true;
                      setData('accuracyRangeMin', value);
                    }}
                    icon="%"
                    fluid
                  />
                </Flex>
                <Flex column hAlign="center">
                  <Text disabled={accracyRangeDisabled}>Maximum: </Text>
                  <Input
                    type="number"
                    disabled={accracyRangeDisabled}
                    inline
                    value={accuracyRangeMax}
                    onChange={(_, { value }): void => {
                      if (!hasUserUpdateAccuracyRange.current) hasUserUpdateAccuracyRange.current = true;
                      setData('accuracyRangeMax', value);
                    }}
                    icon="%"
                    fluid
                  />
                </Flex>
              </Flex>
              {status === Status.StartInference && (
                <Button
                  circular
                  content="Update Accuracy Range"
                  primary
                  loading={isLoading}
                  onClick={(): void => {
                    dispatch(thunkUpdateAccuracyRange(isDemo));
                  }}
                />
              )}
              {/* <Text styles={{ fontSize: '12px' }} success>
                {`The Part ${suggestMessage.partName} contains images ${suggestMessage.rangeMessage}, recommend to set the range to Min ${suggestMessage.min}% and Max ${suggestMessage.max}% `}
              </Text> */}
              <Flex column hAlign="center">
                <Text disabled={accracyRangeDisabled}>Maximum Images to Store: </Text>
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
              </Flex>
            </Flex>
            <Divider vertical color="black" styles={{ margin: '0px 10px' }} />
          </>
        )}
        <Flex column gap="gap.medium">
          <Checkbox
            label="Send message to cloud"
            checked={sendMessageToCloud}
            onChange={(_, { checked }): void => setData('sendMessageToCloud', checked)}
          />
          <Flex column hAlign="center">
            <Text disabled={messageToCloudDisabled}>Frames per minute: </Text>
            <Input
              type="number"
              disabled={messageToCloudDisabled}
              inline
              value={framesPerMin}
              onChange={(_, { value }): void => setData('framesPerMin', value)}
            />
          </Flex>
          <Flex column hAlign="center">
            <Text disabled={messageToCloudDisabled}>Accuracy threshold: </Text>
            <Input
              type="number"
              disabled={messageToCloudDisabled}
              inline
              value={accuracyThreshold}
              onChange={(_, { value }): void => setData('accuracyThreshold', value)}
            />
          </Flex>
        </Flex>
      </Flex>
      <ConfigureButton
        isDemo={isDemo}
        content="Configure"
        primary
        onClick={handleSubmitConfigure}
        disabled={(!selectedCamera || !selectedLocations || !selectedParts || isLoading) && !isDemo}
        loading={isLoading}
        circular
      />
    </Flex>
  );
};

const ConfigureButton = ({ isDemo, onClick, ...props }): JSX.Element => {
  if (isDemo)
    return (
      <WarningDialog
        contentText={
          <p>Trying demo model will replace the current project you created, do you want to continue?</p>
        }
        onConfirm={onClick}
        trigger={<Button {...props} />}
      />
    );
  return <Button {...props} onClick={onClick} />;
};

// TODO Make this integrate with Redux
function useDropdownItems<T>(
  moduleName: string,
  isTestModel: boolean,
  isMultiple?: boolean,
  defaultId?: number | number[],
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
          let targetIdx = 0;
          if (defaultId) targetIdx = data.findIndex((e) => e.id === defaultId);
          setSelectedItem(data[targetIdx]);
        }
        setLoading(false);
        return void 0;
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isMultiple, moduleName, isTestModel, defaultId]);

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
  value?: Value;
  setSelectedModuleItem: (id: string | string[]) => void;
  items: ShorthandCollection<DropdownItemProps>;
  isMultiple: boolean;
  isDemo?: boolean;
  block?: boolean;
};

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  moduleName,
  value,
  setSelectedModuleItem,
  items,
  isMultiple,
  isDemo,
  block = false,
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
        return <p>Unsupported module</p>;
    }
  };

  return (
    <Flex vAlign="center" gap="gap.medium">
      <Text styles={{ width: '90px' }}>{`${block ? 'Default' : 'Select'} ${moduleName}`}</Text>
      {block ? (
        <Dropdown items={items} value={formatDropdownValue(value)} multiple={isMultiple} open={false} />
      ) : (
        <Dropdown
          items={items}
          onChange={onDropdownChange}
          value={formatDropdownValue(value)}
          multiple={isMultiple}
        />
      )}
      {!isDemo && getAddModuleLink()}
    </Flex>
  );
};
