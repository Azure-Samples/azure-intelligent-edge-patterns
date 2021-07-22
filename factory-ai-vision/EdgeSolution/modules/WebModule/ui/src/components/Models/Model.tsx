/* eslint react/display-name: "off" */

import React, { useEffect } from 'react';
import { isEmpty, compose } from 'ramda';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DetailsList, CheckboxVisibility } from '@fluentui/react';

import {
  getTrainingProject,
  trainingProjectIsPredictionModelFactory,
  TrainingProject as TrainingProjectType,
} from '../../store/trainingProjectSlice';

import { Url } from '../../enums';
import { ModelType } from './type';

import { EmptyAddIcon } from '../EmptyAddIcon';

type PassingProps = {
  onAddModelClick: () => void;
};

type ModelsProps = {
  trainingProject: TrainingProjectType[];
};

const BaseModel: React.FC<ModelsProps> = ({ trainingProject }) => {
  const history = useHistory();

  const onRowClick = (item) => {
    history.push(`${Url.MODELS_DETAIL}?modelId=${item.id}`);
  };

  return (
    <DetailsList
      columns={[
        { key: 'name', minWidth: 0, name: 'Name', fieldName: 'name' },
        {
          key: 'type',
          minWidth: 150,
          maxWidth: 100,
          name: 'type',
          fieldName: '',
          onRender: (item: TrainingProjectType) => {
            if (!item.predictionUri) return ModelType.Custom;
            return ModelType.Own;
          },
        },
        { key: 'predictionUri', minWidth: 200, maxWidth: 200, name: 'Uri', fieldName: 'predictionUri' },
        {
          key: 'predictionHeader',
          minWidth: 200,
          maxWidth: 200,
          name: 'Header',
          fieldName: 'predictionHeader',
        },
      ]}
      items={trainingProject}
      checkboxVisibility={CheckboxVisibility.hidden}
      onActiveItemChanged={onRowClick}
    />
  );
};

export default compose(
  (BaseComponent: React.ComponentType<ModelsProps>): React.FC<PassingProps> => (props) => {
    const { onAddModelClick } = props;

    const trainingProjectIsPredictionModelSelector = trainingProjectIsPredictionModelFactory();
    const trainingProjectIsPredictionModel = useSelector(trainingProjectIsPredictionModelSelector);

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(getTrainingProject(true));
    }, [dispatch]);

    if (isEmpty(trainingProjectIsPredictionModel)) {
      return (
        <EmptyAddIcon
          subTitle="Add preexisting models"
          title="Add models"
          primary={{ text: 'Add a model', onClick: onAddModelClick }}
        />
      );
    }

    return <BaseComponent trainingProject={trainingProjectIsPredictionModel} />;
  },
)(BaseModel);
