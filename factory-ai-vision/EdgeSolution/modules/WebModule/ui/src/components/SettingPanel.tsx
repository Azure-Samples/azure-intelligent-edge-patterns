import React, { useEffect, useState } from 'react';
import * as R from 'ramda';
import {
  Panel,
  PanelType,
  TextField,
  Toggle,
  mergeStyles,
  LayerHost,
  PrimaryButton,
  Stack,
  ITextFieldProps,
  IconButton,
  Label,
  Dialog,
  DialogFooter,
  Text,
  MessageBar,
  MessageBarType,
  getTheme,
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
  patchIsCollectData,
  thunkGetAllCvProjects,
} from '../store/setting/settingAction';
import { dummyFunction } from '../utils/dummyFunction';

import { WarningDialog } from './WarningDialog';

type SettingPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
  canBeDismissed: boolean;
  showProjectDropdown: boolean;
  openDataPolicyDialog: boolean;
};

const { palette } = getTheme();

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

export const SettingPanel: React.FC<SettingPanelProps> = ({
  isOpen,
  onDismiss,
  canBeDismissed,
  showProjectDropdown,
  openDataPolicyDialog,
}) => {
  const settingData = useSelector((state: State) => state.setting.current);
  const originSettingData = useSelector((state: State) => state.setting.origin);
  const dontNeedUpdateOrSave = R.equals(settingData, originSettingData);
  const [loading, setLoading] = useState(false);
  const isCollectingData = useSelector((state: State) => state.setting.isCollectData);
  const error = useSelector((state: State) => state.setting.error);

  const dispatch = useDispatch();

  const onSave = async () => {
    try {
      setLoading(true);

      await dispatch(thunkPostSetting());

      setLoading(false);
      onDismiss();
    } catch (e) {
      alert(e);
    }
  };

  const updateIsCollectData = (isCollectData, hasInit?): void => {
    dispatch(patchIsCollectData({ id: settingData.id, isCollectData, hasInit }));
  };

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  useEffect(() => {
    if (showProjectDropdown) dispatch(thunkGetAllCvProjects());
  }, [dispatch, showProjectDropdown]);

  const [gitSha1, setgitSha1] = useState('');

  useEffect(() => {
    // Could only get the file in production build
    if (process.env.NODE_ENV === 'production') {
      Axios.get('/static/git_sha1.txt')
        .then((res) => {
          setgitSha1(res.data);
          return void 0;
        })
        .catch(alert);
    }
  }, []);

  return (
    <>
      {isOpen && <LayerHost id={MAIN_LAYER_HOST_ID} className={layerHostClass} />}
      <Panel
        hasCloseButton={canBeDismissed}
        headerText="Settings"
        isOpen={isOpen}
        type={PanelType.smallFluid}
        onDismiss={onDismiss}
        {...(!canBeDismissed && { onOuterClick: dummyFunction })}
        layerProps={{
          hostId: MAIN_LAYER_HOST_ID,
        }}
        isFooterAtBottom
        onRenderFooterContent={() => (
          <Text variant="small" styles={{ root: { color: palette.neutralTertiary } }}>
            Version: {gitSha1}
          </Text>
        )}
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
          {error && <MessageBar messageBarType={MessageBarType.blocked}>{error.message}</MessageBar>}
          <Stack.Item>
            <WarningDialog
              contentText={
                <Text variant="large">
                  Update Key / Namespace will remove all the objects, sure you want to update?
                </Text>
              }
              confirmButton="Yes"
              onConfirm={onSave}
              trigger={<PrimaryButton text="Save" disabled={dontNeedUpdateOrSave} />}
            />
          </Stack.Item>
          {loading && <Spinner label="loading" />}
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
                  . You can learn more about data collection and use in the help documentation and our privacy
                  statement. Your use of the software operates as your consent to these practices.
                </p>
              </>
            }
            open={openDataPolicyDialog}
            confirmButton="I agree"
            cancelButton="I don't agree"
            onConfirm={(): void => updateIsCollectData(true, true)}
            onCancel={(): void => updateIsCollectData(false, true)}
          />
        </Stack>
      </Panel>
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
        hidden={!isModalOpen}
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
          <img src="/icons/guide_step_2.png" alt="guide" style={{ width: '100%' }} />
          <p>
            Step 3: Choose the resources under the account, you will see information of &quot;Key&quot; and
            &quot;Endpoint&quot;
          </p>
          <img src="/icons/guide_step_3.png" alt="guide" style={{ width: '100%' }} />
        </Stack>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={() => setisModalOpen(false)} />
        </DialogFooter>
      </Dialog>
    </>
  );
};
