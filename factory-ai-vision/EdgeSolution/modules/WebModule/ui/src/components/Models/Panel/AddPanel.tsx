import React, { useState, useCallback } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { assocPath } from 'ramda';
import { useDispatch } from 'react-redux';

import {
  pullCVProjects,
  CreatOwnModelPayload,
  createCustomProject,
  createNewTrainingProject,
} from '../../../store/trainingProjectSlice';
import { CreateFormType } from '../type';

import AddPanelManagement from './AddPanelManagement';

type ModelType = 'custom' | 'own' | 'ovms';

type Props = {
  isOpen: boolean;
  initialValue?: CreateFormType;
  modelType: ModelType;
  onDissmiss: () => void;
};

const initialForm: CreateFormType = {
  name: '',
  endPoint: '',
  labels: '',
  selectedCustomVisionId: '',
  tags: [],
  category: 'object',
};

const getAddOwnModelPayload = (formData: CreateFormType): CreatOwnModelPayload => ({
  is_prediction_module: true,
  name: formData.name,
  labels: formData.labels,
  prediction_uri: formData.endPoint,
  prediction_header: '',
});

const AddModelPanel: React.FC<Props> = (props) => {
  const { isOpen, initialValue = initialForm, modelType, onDissmiss } = props;

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFormType>(initialValue);

  const dispatch = useDispatch();

  const validate = useCallback(() => {
    let hasError = false;

    ['name', 'endPoint'].forEach((key) => {
      if (!formData[key]) {
        hasError = true;
      }
    });

    return hasError;
  }, [formData]);

  const onCreateModel = useCallback(async () => {
    if (validate()) {
      setErrorMsg('This field is required');
      return;
    }
    setIsLoading(true);

    await dispatch(createCustomProject(getAddOwnModelPayload(formData)));
    setIsLoading(false);
    onDissmiss();
    setFormData(initialValue);
  }, [dispatch, formData, onDissmiss, validate, initialValue]);

  const onCreateCustomVisionProject = useCallback(async () => {
    setIsLoading(true);

    await dispatch(
      // pullCVProjects({
      //   selectedCustomvisionId: formData.selectedCustomVisionId,
      //   loadFullImages: false,
      // }),
      createNewTrainingProject(formData.name),
    );

    setIsLoading(false);
    onDissmiss();
  }, [dispatch, formData, onDissmiss]);

  const onLoadModel = useCallback(async () => {
    setIsLoading(true);

    await dispatch(
      pullCVProjects({
        selectedCustomvisionId: formData.selectedCustomVisionId,
        loadFullImages: false,
      }),
    );

    setIsLoading(false);
    onDissmiss();
  }, [dispatch, formData, onDissmiss]);

  const onAddOvmsModel = useCallback(() => {
    console.log('onAddOvmsModel');
  }, []);

  const onChange = useCallback((key: keyof CreateFormType, newValue: string | boolean) => {
    setErrorMsg('');

    setFormData(assocPath([key], newValue));
  }, []);

  const onAddTag = useCallback((tag: string) => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
  }, []);

  const onRemoveTag = useCallback((idx) => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags].slice(idx, 1) }));
  }, []);

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText="New Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          {modelType === 'custom' && (
            <PrimaryButton
              onClick={formData.name === '' ? onLoadModel : onCreateCustomVisionProject}
              disabled={isLoading}
              text="Add"
            />
          )}
          {modelType === 'ovms' && <PrimaryButton onClick={onAddOvmsModel} disabled={isLoading} text="Add" />}
          {modelType === 'own' && <PrimaryButton onClick={onCreateModel} disabled={isLoading} text="Add" />}
          <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack tokens={{ childrenGap: '10px' }}>
        <AddPanelManagement
          errorMsg={errorMsg}
          onChange={onChange}
          modelType={modelType}
          formData={formData}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      </Stack>
    </Panel>
  );
};

export default AddModelPanel;
