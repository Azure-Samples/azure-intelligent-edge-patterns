import React, { useEffect, useState } from 'react';
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
  DefaultButton,
  Spinner,
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
  const projectData = useSelector((state: State) => {
    return state.project.data;
  });
  const [loading, setloading] = useState(false);

  const dispatch = useDispatch();

  const onSave = async () => {
    try {
      await dispatch(thunkPostSetting());
      onDismiss();
    } catch (e) {
      alert(e);
    }
  };

  const onDropdownChange = (_, option: IDropdownOption): void => {
    setselectedCustomvisionId(option.key);
  };

  const onLoad = (loadFullImages): void => {
    setloading(true);
    Axios.get(
      `/api/projects/${
        projectData.trainingProject
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
              <PrimaryButton onClick={onSave} text="Save" />
            </Stack.Item>
            <Dropdown
              className={textFieldClass}
              label="Project"
              required
              options={cvProjectOptions}
              onChange={onDropdownChange}
              selectedKey={selectedCustomvisionId}
            />
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DefaultButton text="Load" onClick={() => onLoad(true)} />
              <DefaultButton text="Load Partial" onClick={() => onLoad(false)} />
              {loading && <Spinner />}
            </Stack>
            <Toggle label="Allow sending usage data" styles={{ root: { paddingTop: 50 } }} />
          </Stack>
        </Panel>
      </Customizer>
    </>
  );
};
