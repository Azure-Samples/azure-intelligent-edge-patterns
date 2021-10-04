import React, { useMemo, useCallback } from 'react';
import {
  CommandBar,
  ICommandBarItemProps,
  getTheme,
  Stack,
  Breadcrumb,
  ProgressIndicator,
  mergeStyleSets,
  DefaultButton,
} from '@fluentui/react';
import { useBoolean } from '@uifabric/react-hooks';
import { useSelector, useDispatch } from 'react-redux';

import { State } from 'RootStateType';

import { Url } from '../constant';
import { thunkCancelCameraSetting } from '../store/cameraSetting/cameraSettingActions';

import AddCameraPanel, { PanelMode } from '../components/AddCameraPanel';
import { CameraDetailList } from '../components/CameraDetailList';
import { Instruction } from '../components/Instruction';

const theme = getTheme();

const classes = mergeStyleSets({
  container: {
    position: 'relative',
  },
  progressWrapper: {
    position: 'absolute',
    top: '15px',
    left: '200px',
    '> div': {
      marginTop: '5px',
    },
  },
  progress: {
    width: '500px',
  },
});

export const Cameras: React.FC = () => {
  const [isPanelOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

  const showInstruction = useSelector(
    (state: State) => state.camera.nonDemo.length > 0 && state.labelImages.ids.length === 0,
  );
  const isCameraCreating = useSelector((state: State) => state.cameraSetting.isCreating);

  const dispatch = useDispatch();

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'Add',
        iconProps: {
          iconName: 'Add',
        },
        onClick: openPanel,
      },
    ],
    [openPanel],
  );

  const onCancelButtonClick = useCallback(() => {
    dispatch(thunkCancelCameraSetting());
  }, [dispatch]);

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        {showInstruction && (
          <Instruction
            title="Successfully added a camera!"
            subtitle="Now that you have added a camera, you can use that camera to capture images and tag objects for your model."
            button={{ text: 'Go to Images', to: Url.IMAGES }}
          />
        )}
        <Stack className={classes.container}>
          <Breadcrumb items={[{ key: 'cameras', text: 'Cameras' }]} />
          {isCameraCreating && (
            <Stack
              className={classes.progressWrapper}
              horizontal
              horizontalAlign="center"
              tokens={{ childrenGap: '20px' }}
            >
              <ProgressIndicator className={classes.progress} />
              <DefaultButton text="Cancel" onClick={onCancelButtonClick} />
            </Stack>
          )}
        </Stack>
        <CameraDetailList onAddBtnClick={openPanel} />
      </Stack>
      <AddCameraPanel isOpen={isPanelOpen} onDissmiss={dismissPanel} mode={PanelMode.Create} />
    </Stack>
  );
};
