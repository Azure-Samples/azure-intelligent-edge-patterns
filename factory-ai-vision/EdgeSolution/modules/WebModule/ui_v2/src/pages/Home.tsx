import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  Stack,
  CommandBar,
  getTheme,
  ICommandBarItemProps,
  Pivot,
  PivotItem,
  Spinner,
} from '@fluentui/react';
import { GetStarted } from '../components/GetStarted';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllCameras, getCameras } from '../store/cameraSlice';
import { State } from 'RootStateType';
import { selectAllImages, getImages } from '../store/imageSlice';
import { thunkGetProject } from '../store/project/projectActions';
import { Status } from '../store/project/projectTypes';

const theme = getTheme();

export const Home: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const hasCamera = useSelector((state: State) => selectAllCameras(state).length > 0);
  const hasImages = useSelector((state: State) => selectAllImages(state).length > 0);
  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getCameras(false));
      await dispatch(getImages());
      await dispatch(thunkGetProject(false));
      setLoading(false);
      setLoading(false);
    })();
  }, []);

  const commandBarItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        key: 'addBtn',
        text: 'New Task',
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => {},
      },
    ],
    [],
  );

  const onPivotChange = (item: PivotItem) => {
    history.push(`/${item.props.itemKey}`);
  };

  if (loading) return <Spinner label="Loading" />;

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <CommandBar
        items={commandBarItems}
        styles={{ root: { borderBottom: `solid 1px ${theme.palette.neutralLight}` } }}
      />
      <Stack styles={{ root: { padding: '15px' } }} grow>
        <Pivot selectedKey={location.pathname.split('/')[1]} onLinkClick={onPivotChange}>
          <PivotItem itemKey="getStarted" headerText="Get started">
            <GetStarted hasCamera={hasCamera} hasImages={hasImages} hasTask={projectHasConfiged} />
          </PivotItem>
          <PivotItem itemKey="task" headerText="Task">
            Task
          </PivotItem>
        </Pivot>
      </Stack>
    </Stack>
  );
};
