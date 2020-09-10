import React, { useEffect, useState } from 'react';
import * as R from 'ramda';
import {
  Panel,
  PanelType,
  TextField,
  Toggle,
  mergeStyles,
  LayerHost,
  Customizer,
  PrimaryButton,
  Stack,
  Dropdown,
  IDropdownOption,
  Spinner,
  ITextFieldProps,
  IconButton,
  Label,
  Dialog,
  DialogFooter,
  Text,
  Checkbox,
} from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import Axios from 'axios';

import { State } from 'RootStateType';
import {
  checkSettingStatus,
  updateNamespace,
  updateKey,
  thunkPostSetting,
  thunkGetAllCvProjects,
} from '../store/setting/settingAction';
import { updateOriginProjectData } from '../store/project/projectActions';
import { clearParts } from '../store/partSlice';
import { WarningDialog } from './WarningDialog';
import { selectAllTrainingProjects } from '../store/trainingProjectSlice';
import { getAppInsights } from '../TelemetryService';

type SettingPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
};

const textFieldClass = mergeStyles({
  width: 500,
});
const layerHostClass = mergeStyles({
  position: 'absolute',
  height: '100%',
  width: '100%',
  top: 0,
  left: 0,
});
const MAIN_LAYER_HOST_ID = 'mainLayer';

export const SettingPanel: React.FC<SettingPanelProps> = ({ isOpen: propsIsOpen, onDismiss }) => {
  const isTrainerValid = useSelector((state: State) => state.setting.isTrainerValid);
  const appInsightHasInit = useSelector((state: State) => state.setting.appInsightHasInit);
  const settingData = useSelector((state: State) => state.setting.current);
  const cvProjectOptions = useSelector((state: State) =>
    state.setting.cvProjects.map((e) => ({ key: e.id, text: e.name })),
  );
  const defaultCustomvisionId = useSelector((state: State) => {
    const { trainingProject } = state.project.originData;
    return state.trainingProject.entities[trainingProject]?.customVisionId;
  });
  const [selectedCustomvisionId, setselectedCustomvisionId] = useState(null);
  const originSettingData = useSelector((state: State) => state.setting.origin);
  const [loading, setloading] = useState(false);
  const cannotUpdateOrSave = R.equals(settingData, originSettingData);
  const [loadFullImages, setLoadFullImages] = useState(false);
  const [loadImgWarning, setloadImgWarning] = useState(false);
  const traininProject = useSelector((state: State) => selectAllTrainingProjects(state)[0]);
  const isCollectingData = useSelector((state: State) => state.setting.isCollectData);

  const dispatch = useDispatch();

  const onSave = async () => {
    try {
      await dispatch(thunkPostSetting());
    } catch (e) {
      alert(e);
    }
  };

  const onDropdownChange = (_, option: IDropdownOption): void => {
    setselectedCustomvisionId(option.key);
  };

  const onLoad = (): void => {
    setloading(true);
    Axios.get(
      `/api/projects/${
        traininProject.id
      }/pull_cv_project?customvision_project_id=${selectedCustomvisionId}&partial=${Number(!loadFullImages)}`,
    )
      .then(() => {
        // FIXME Migrate the two to one actions
        dispatch(updateOriginProjectData(false));
        dispatch(clearParts());
        return void 0;
      })
      .catch(alert)
      .finally(() => setloading(false));
  };

  const onLoadFullImgChange = (_, checked: boolean) => {
    if (checked) setloadImgWarning(true);
    else setLoadFullImages(checked);
  };

  const updateIsCollectData = (isCollectData, hasInit?): void => {
    Axios.patch(`/api/settings/${settingData.id}`, {
      is_collect_data: isCollectData,
      ...(hasInit && { app_insight_has_init: hasInit }),
    })
      .then(() => {
        const appInsight = getAppInsights();
        if (!appInsight) throw Error('App Insight hasnot been initialize');
        appInsight.config.disableTelemetry = !isCollectData;
        // FIXME
        window.location.reload();
        return void 0;
      })
      .catch((err) => {
        alert(err);
      });
  };

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  useEffect(() => {
    if (settingData.id !== -1) {
      dispatch(thunkGetAllCvProjects());
    }
  }, [dispatch, settingData.id]);

  useEffect(() => {
    setselectedCustomvisionId(defaultCustomvisionId);
  }, [defaultCustomvisionId]);

  const isOpen = !isTrainerValid || !appInsightHasInit || propsIsOpen;

  return (
    <>
      {isOpen && <LayerHost id={MAIN_LAYER_HOST_ID} className={layerHostClass} />}
      <Customizer scopedSettings={{ Layer: { hostId: MAIN_LAYER_HOST_ID } }}>
        <Panel
          hasCloseButton
          headerText="Settings"
          isOpen={isOpen}
          type={PanelType.smallFluid}
          onDismiss={onDismiss}
          // override the outer click function to avoid it call onDismiss as default
          onOuterClick={() => {}}
        >
          <Stack tokens={{ childrenGap: 17 }}>
            <h4>Azure Cognitive Services settings</h4>
            <TextField
              className={textFieldClass}
              label="Endpoint"
              required
              value={settingData.namespace}
              onChange={(_, value): void => {
                dispatch(updateNamespace(value));
              }}
              onRenderLabel={(props) => <CustomLabel {...props} />}
            />
            <TextField
              className={textFieldClass}
              label="Key"
              required
              value={settingData.key}
              onChange={(_, value): void => {
                dispatch(updateKey(value));
              }}
            />
            <Stack.Item>
              <WarningDialog
                contentText={
                  <Text variant="large">
                    Update Key / Namespace will remove all the parts, sure you want to update?
                  </Text>
                }
                confirmButton="Yes"
                onConfirm={onSave}
                trigger={<PrimaryButton text="Save" disabled={cannotUpdateOrSave} />}
              />
            </Stack.Item>
            {isTrainerValid && (
              <>
                <Dropdown
                  className={textFieldClass}
                  label="Project"
                  required
                  options={cvProjectOptions}
                  onChange={onDropdownChange}
                  selectedKey={selectedCustomvisionId}
                />
                <Checkbox checked={loadFullImages} label="Load Full Images" onChange={onLoadFullImgChange} />
                <WarningDialog
                  open={loadImgWarning}
                  contentText={
                    <Text variant="large">
                      Depends on the number of images, loading full images takes time
                    </Text>
                  }
                  onConfirm={() => {
                    setLoadFullImages(true);
                    setloadImgWarning(false);
                  }}
                  onCancel={() => setloadImgWarning(false)}
                />
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                  <WarningDialog
                    contentText={
                      <Text variant="large">
                        Load Project will remove all the parts, sure you want to do that?
                      </Text>
                    }
                    trigger={<PrimaryButton text="Load" disabled={loading} />}
                    onConfirm={onLoad}
                  />
                  {loading && <Spinner label="loading" />}
                </Stack>
              </>
            )}
            <Toggle
              label="Allow sending usage data"
              styles={{ root: { paddingTop: 50 } }}
              checked={isCollectingData}
              onChange={(_, checked) => updateIsCollectData(checked, true)}
            />
            <WarningDialog
              contentText={
                <>
                  <h1 style={{ textAlign: 'center' }}>Data Collection Policy</h1>
                  <p>
                    The software may collect information about your use of the software and send it to
                    Microsoft. Microsoft may use this information to provide services and improve our products
                    and services. You may turn off the telemetry as described in the repository or clicking
                    settings on top right corner. Our privacy statement is located at{' '}
                    <a href="https://go.microsoft.com/fwlink/?LinkID=824704">
                      https://go.microsoft.com/fwlink/?LinkID=824704
                    </a>
                    . You can learn more about data collection and use in the help documentation and our
                    privacy statement. Your use of the software operates as your consent to these practices.
                  </p>
                </>
              }
              open={!appInsightHasInit}
              confirmButton="I agree"
              cancelButton="I don't agree"
              onConfirm={(): void => updateIsCollectData(true, true)}
              onCancel={(): void => updateIsCollectData(false, true)}
            />
          </Stack>
        </Panel>
      </Customizer>
    </>
  );
};

export const CustomLabel = (props: ITextFieldProps): JSX.Element => {
  const [isModalOpen, setisModalOpen] = useState(false);

  return (
    <>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
        <Label required={props.required}>{props.label}</Label>
        <IconButton iconProps={{ iconName: 'Info' }} onClick={() => setisModalOpen(true)} />
      </Stack>
      <Dialog
        title="Get Endpoint and Key"
        isOpen={isModalOpen}
        modalProps={{ layerProps: { hostId: null } }}
        maxWidth={800}
      >
        <Stack>
          <p>
            Step 1: Login Custom vision,{' '}
            <a href="https://www.customvision.ai/" target="_blank" rel="noopener noreferrer">
              https://www.customvision.ai/
            </a>
          </p>
          <p>Step 2: Click on the setting icon on the top</p>
          <img src="/icons/guide_step_2.png" style={{ width: '100%' }} />
          <p>
            Step 3: Choose the resources under the account, you will see information of &quot;Key&quot; and
            &quot;Endpoint&quot;
          </p>
          <img src="/icons/guide_step_3.png" style={{ width: '100%' }} />
        </Stack>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={() => setisModalOpen(false)} />
        </DialogFooter>
      </Dialog>
    </>
  );
};