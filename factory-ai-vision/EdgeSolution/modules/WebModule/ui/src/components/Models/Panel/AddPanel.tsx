import React, { useState, useCallback } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { assocPath } from 'ramda';
import { useDispatch } from 'react-redux';

import {
  pullCVProjects,
  CreatOwnModelPayload,
  createCustomProject,
  // createNewTrainingProject,
  createCustomVisionProjectAndModel,
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

const isValid = (isExisting: boolean, formData: CreateFormType): boolean => {
  if (isExisting && formData.selectedCustomVisionId === '') return false;
  if (!isExisting && (formData.name === '' || formData.tags.length < 2)) return false;
  return true;
};

const AddModelPanel: React.FC<Props> = (props) => {
  const { isOpen, initialValue = initialForm, modelType, onDissmiss } = props;

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFormType>(initialValue);
  const [isExistingProject, setIsExistingProject] = useState(false);

  const dispatch = useDispatch();

  const onClosePanel = useCallback(() => {
    setIsExistingProject(false);
    setFormData(initialValue);
    onDissmiss();
    setErrorMsg('');
  }, [initialValue, onDissmiss]);

  const onCreateOwnModel = useCallback(async () => {
    if (formData.name === '' || formData.endPoint === '') {
      setErrorMsg('This field is required');
      return;
    }
    setIsLoading(true);

    await dispatch(createCustomProject(getAddOwnModelPayload(formData)));

    setIsLoading(false);
    onClosePanel();
  }, [dispatch, formData, onClosePanel]);

  const onCreateCustomVisionProject = useCallback(async () => {
    if (formData.name === '' || formData.tags.length < 2) {
      setErrorMsg('This field is required');
      return;
    }

    setIsLoading(true);

    await dispatch(createCustomVisionProjectAndModel(formData.name));

    setIsLoading(false);
    onClosePanel();
  }, [dispatch, formData, onClosePanel]);

  const onLoadExistingModel = useCallback(async () => {
    if (formData.selectedCustomVisionId === '') {
      setErrorMsg('This field is required');
      return;
    }

    setIsLoading(true);

    await dispatch(
      pullCVProjects({
        selectedCustomvisionId: formData.selectedCustomVisionId,
        loadFullImages: false,
      }),
    );

    setIsLoading(false);
    onClosePanel();
  }, [dispatch, formData, onClosePanel]);

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

  const onRemoveTag = useCallback(
    (idx) => {
      const newTags = [...formData.tags];
      newTags.splice(idx, 1);

      setFormData((prev) => ({ ...prev, tags: newTags }));
    },
    [formData],
  );

  console.log('formData', formData);
  console.log('isAddModelValid(formData)', !isValid(isExistingProject, formData));

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClosePanel}
      hasCloseButton
      headerText="New Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          {modelType === 'custom' && (
            <PrimaryButton
              onClick={isExistingProject ? onLoadExistingModel : onCreateCustomVisionProject}
              disabled={isLoading}
              text="Add"
            />
          )}
          {modelType === 'ovms' && <PrimaryButton onClick={onAddOvmsModel} disabled={isLoading} text="Add" />}
          {modelType === 'own' && (
            <PrimaryButton onClick={onCreateOwnModel} disabled={isLoading} text="Add" />
          )}
          <DefaultButton onClick={onClosePanel}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack tokens={{ childrenGap: '10px' }}>
        <AddPanelManagement
          errorMsg={errorMsg}
          modelType={modelType}
          formData={formData}
          onResetErrorMsg={() => setErrorMsg('')}
          onChange={onChange}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          isExistingProject={isExistingProject}
          onChangeExistingProject={() => {
            setErrorMsg('');
            setIsExistingProject((prev) => !prev);
          }}
        />
      </Stack>
    </Panel>
  );
};

export default AddModelPanel;
