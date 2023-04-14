import React, { useCallback, useState } from 'react';
import { useHistory, generatePath, useLocation } from 'react-router-dom';
import { Breadcrumb, Stack, IBreadcrumbItem, Pivot, PivotItem, Label, IconButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { TrainingProject, deleteTrainingProject } from '../../store/trainingProjectSlice';
import { Url } from '../../constant';
import { getModelDetailClasses } from './styles';

import Basics from './Basics/Basics';
import ImageTraining from './ImageTraining/ImageTraining';

type Props = {
  cvModel: TrainingProject;
};

type PivotTabKey = 'basics' | 'trainingImages';

const ModelDetail: React.FC<Props> = ({ cvModel }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(
    location.pathname.split('/')[3] as PivotTabKey,
  );

  const classes = getModelDetailClasses();

  const breadCrumbItems: IBreadcrumbItem[] = [
    {
      key: 'home',
      text: 'Home',
      onClick: () => history.push(Url.HOME),
    },
    {
      key: 'models',
      text: 'Models',
      onClick: () => history.push(Url.MODELS),
    },
    { key: cvModel.name, text: '' },
  ];

  const onLinkClick = useCallback(
    (item?: PivotItem) => {
      const key = item?.props.itemKey! as PivotTabKey;
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.MODELS_CV_MODEL, {
          id: cvModel.id,
          key: key,
        }),
      );
    },
    [cvModel, history],
  );

  const onModelDelete = useCallback(async () => {
    await dispatch(
      deleteTrainingProject({
        id: cvModel.id,
        resolve: () => {
          history.push(Url.MODELS);
        },
      }),
    );
  }, [dispatch, history, cvModel]);

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <Breadcrumb styles={{ itemLink: classes.breadcrumb }} items={breadCrumbItems} />
      <Stack grow>
        <Stack className={classes.modelTitleWrapper} horizontal horizontalAlign="space-between">
          <Stack horizontal>
            <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', color: '#323130' } }}>
              {cvModel.name}
            </Label>
          </Stack>
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onModelDelete} />
        </Stack>
        <Pivot
          styles={{ root: { paddingLeft: '20px' }, itemContainer: { height: 'calc(100% - 44px)' } }}
          onLinkClick={onLinkClick}
          defaultSelectedKey={localPivotKey}
        >
          <PivotItem headerText="Basics" itemKey="basics" />
          <PivotItem
            headerText="Image Training"
            itemKey="trainingImages"
            style={{ height: '100%', position: 'relative' }}
          />
        </Pivot>
        <Switch>
          <Route exact path={Url.MODELS_CV_DETAIL_BASICS} render={() => <Basics cvModel={cvModel} />} />
          <Route
            exact
            path={Url.MODELS_CV_DETAIL_TRAINING_IMAGES}
            render={() => <ImageTraining cvModel={cvModel} />}
          />
        </Switch>
      </Stack>
    </Stack>
  );
};

export default ModelDetail;
