import React, { useEffect } from 'react';
import { Panel, PanelType, TextField, Toggle, mergeStyles, LayerHost, Customizer } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from 'RootStateType';
import { Setting } from '../store/setting/settingType';
import { checkSettingStatus } from '../store/setting/settingAction';

type SettingPanelProps = {
  isOpen: boolean;
  onDismiss: () => void;
};

const textFieldClass = mergeStyles({
  width: 500,
  paddingTop: 17,
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
  const { isTrainerValid, appInsightHasInit } = useSelector<State, Setting>((state) => state.setting);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  const isOpen = !isTrainerValid || !appInsightHasInit || propsIsOpen;

  return (
    <>
      <LayerHost id={MAIN_LAYER_HOST_ID} className={layerHostClass} />
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
          <h4>Azure Cognitive Services settings</h4>
          <TextField className={textFieldClass} label="Endpoint" required />
          <TextField className={textFieldClass} label="Key" required />
          <TextField className={textFieldClass} label="Project" required />
          <Toggle label="Allow sending usage data" styles={{ root: { paddingTop: 50 } }} />
        </Panel>
      </Customizer>
    </>
  );
};
