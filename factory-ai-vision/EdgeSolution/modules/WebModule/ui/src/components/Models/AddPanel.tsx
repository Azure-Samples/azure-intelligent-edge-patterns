import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Panel,
  TextField,
  Stack,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  Toggle,
  IIconProps,
  Label,
  Checkbox,
  Text,
  // Spinner,
} from '@fluentui/react';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import * as R from 'ramda';
import { useSelector, useDispatch } from 'react-redux';

// import { thunkPostCustomProject } from '../../store/project/projectActions';
import { createCustomProject, updateCustomProject } from '../../store/trainingProjectSlice';
import { State as RootState } from 'RootStateType';
import { selectNonDemoProject, pullCVProjects } from '../../store/trainingProjectSlice';

import { CreateProjectDialog } from '../CreateProjectDialog';
import { WarningDialog } from '../WarningDialog';

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export enum PanelMode {
  Create,
  Update,
}

type ModelType = 'custom' | 'own' | 'ovms';

type CustomFormType = {
  name: string;
  endPoint: string;
  labels: string;
  header: string;
  setting: boolean;
  id?: number;
};

type Props = {
  isOpen: boolean;
  initialValue?: CustomFormType;
  mode: PanelMode;
  onDissmiss: () => void;
};

const initialForm: CustomFormType = {
  name: '',
  endPoint: '',
  labels: '',
  header: '',
  setting: false,
};

const uploadIcon: IIconProps = { iconName: 'Upload' };

const AddModelPanel: React.FC<Props> = (props) => {
  const { isOpen, initialValue = initialForm, mode, onDissmiss } = props;

  const customVisionProjectOptions = useSelector((state: RootState) =>
    state.setting.cvProjects.map((e) => ({ key: e.id, text: e.name })),
  );
  const defaultCustomVisionId = useSelector((state: RootState) => {
    const [selectedTrainingProject] = selectNonDemoProject(state);
    return state.trainingProject.entities[selectedTrainingProject?.id]?.customVisionId;
  });
  const [selectedCustomVisionId, setSelectedCustomVisionId] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomFormType>(initialValue);
  const [fileName, setFileName] = useState('');
  const [selectedType, setSelectedType] = useState<ModelType>('custom');
  const [isFullImages, setIsFullImages] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const fileRef = useRef(null);

  const options: IDropdownOption[] = [
    { key: 'custom', text: 'Custom Vision Model' },
    { key: 'own', text: 'Own Model' },
    { key: 'ovms', text: 'Ovms Model' },
  ];

  const dispatch = useDispatch();

  useEffect(() => {
    if (defaultCustomVisionId) {
      setSelectedCustomVisionId(defaultCustomVisionId);
    }
  }, [defaultCustomVisionId]);

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

    await dispatch(createCustomProject(formData));

    setIsLoading(false);
    onDissmiss();
    setFormData(initialValue);
  }, [dispatch, formData, mode, onDissmiss, validate]);

  const onLoadModel = useCallback(async () => {
    setIsLoading(true);

    await dispatch(
      pullCVProjects({ selectedCustomvisionId: selectedCustomVisionId, loadFullImages: isFullImages }),
    );

    window.location.reload();

    setIsLoading(false);
  }, [dispatch, selectedCustomVisionId, isFullImages]);

  const onChange = (key: keyof CustomFormType, newValue: string | boolean) => {
    setErrorMsg('');

    setFormData(R.assocPath([key], newValue));
  };

  const onUploadClick = () => {
    fileRef.current.click();
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.files[0].name);
    const file = (await toBase64(e.target.files[0])) as string;

    if (file) {
      setFormData({
        ...formData,
        labels: file,
      });
    }
  };

  const onDropdownChange = useCallback((_, option?: IDropdownOption) => {
    setSelectedType(option.key as ModelType);
  }, []);

  const onProjectDropdownChange = (_, option: IDropdownOption) => {
    setSelectedCustomVisionId(option.key);
  };

  const onLoadFullImgChange = (_, checked: boolean) => {
    if (checked) setIsLoadingImages(true);
    else setIsFullImages(checked);
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDissmiss}
      hasCloseButton
      headerText="New Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          {selectedType === 'custom' && (
            <PrimaryButton onClick={onLoadModel} disabled={isLoading} text="Load" />
          )}
          {selectedType === 'own' && (
            <PrimaryButton onClick={onCreateModel} disabled={isLoading} text="Add" />
          )}
          <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack tokens={{ childrenGap: '10px' }}>
        <Dropdown label="Type" options={options} selectedKey={selectedType} onChange={onDropdownChange} />
        {selectedType === 'custom' && (
          <>
            <Dropdown
              label="Project"
              required
              options={customVisionProjectOptions}
              onChange={onProjectDropdownChange}
              selectedKey={selectedCustomVisionId}
              calloutProps={{ calloutMaxHeight: 300 }}
            />
            <CreateProjectDialog />
            <Checkbox checked={isFullImages} label="Load Full Images" onChange={onLoadFullImgChange} />
            <WarningDialog
              open={isLoadingImages}
              contentText={
                <Text variant="large">Depends on the number of images, loading full images takes time</Text>
              }
              onConfirm={() => {
                setIsFullImages(true);
                setIsLoadingImages(false);
              }}
              onCancel={() => setIsLoadingImages(false)}
            />
            {/* <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton text="Load" disabled={isLoading} onClick={onLoadModel} />
              {isLoading && <Spinner label="loading" />}
            </Stack> */}
          </>
        )}
        {selectedType === 'own' && (
          <>
            <TextField
              label="Name"
              required
              errorMessage={R.isEmpty(formData.name) && errorMsg}
              onChange={(_, newValue) => onChange('name', newValue)}
            />
            <TextField
              label="Endpoint"
              value={formData.endPoint}
              errorMessage={R.isEmpty(formData.endPoint) && errorMsg}
              onChange={(_, newValue) => onChange('endPoint', newValue)}
              required
            />
            <Stack styles={{ root: { padding: '5px 0', display: 'block' } }}>
              <Label>Labels</Label>
              <DefaultButton text="Upload" iconProps={uploadIcon} label="Labels" onClick={onUploadClick} />
              {fileName && <Label>{fileName}</Label>}
              <input
                ref={fileRef}
                type="file"
                onChange={onUpload}
                accept=".txt"
                style={{ display: 'none' }}
              />
            </Stack>
            <Toggle
              label="Secure"
              checked={formData.setting}
              onText="On"
              offText="Off"
              onChange={(_, checked) => onChange('setting', checked)}
            />
            <TextField
              label="Header"
              value={formData.header}
              onChange={(_, newValue) => onChange('header', newValue)}
            />
          </>
        )}
        {selectedType === 'ovms' && <div>ovms</div>}
      </Stack>
    </Panel>
  );
};

export default AddModelPanel;
