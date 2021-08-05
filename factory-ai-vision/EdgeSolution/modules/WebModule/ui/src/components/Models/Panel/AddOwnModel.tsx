import React, { useState, useCallback, useRef } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  Label,
  Text,
  TextField,
  mergeStyleSets,
} from '@fluentui/react';
import { assocPath } from 'ramda';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'ramda';

import { CreatOwnModelPayload, createCustomProject } from '../../../store/trainingProjectSlice';
import { CreateOwnModelForm } from '../type';

type Props = {
  isOpen: boolean;
  onDissmiss: () => void;
};

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const initialForm: CreateOwnModelForm = {
  name: '',
  endPoint: '',
  labels: '',
};

const getAddOwnModelPayload = (formData: CreateOwnModelForm): CreatOwnModelPayload => ({
  is_prediction_module: true,
  name: formData.name,
  labels: formData.labels,
  prediction_uri: formData.endPoint,
  prediction_header: '',
});

const isValid = (formData: CreateOwnModelForm): boolean => {
  if (formData.name === '' || formData.endPoint === '') return false;
  return true;
};

const getClasses = () =>
  mergeStyleSets({
    itemWrapper: {
      marginTop: '25px',
    },
    itemTitle: { fontSize: '13px', lineHeight: '18px', color: '#605E5C' },
    item: { fontSize: '13px', lineHeight: '18px', color: '#000' },
    tip: { fontSize: '14px', lineHeight: '20px', color: '#605E5C' },
    tagsWrapper: {
      marginTop: '20px',
    },
  });

const AddModelPanel: React.FC<Props> = (props) => {
  const { isOpen, onDissmiss } = props;

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOwnModelForm>(initialForm);
  const [isExistingProject, setIsExistingProject] = useState(false);
  const [fileName, setFileName] = useState('');

  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const classes = getClasses();

  const onUploadClick = useCallback(() => {
    fileRef.current.click();
  }, []);

  const onClosePanel = useCallback(() => {
    setIsExistingProject(false);
    setFormData(initialForm);
    onDissmiss();
    setErrorMsg('');
  }, [onDissmiss]);

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

  const onChange = useCallback((key: keyof CreateOwnModelForm, newValue: string | boolean) => {
    setErrorMsg('');

    setFormData(assocPath([key], newValue));
  }, []);

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setFileName(e.target.files[0].name);
      const file = (await toBase64(e.target.files[0])) as string;

      if (file) {
        onChange('labels', file);
      }
    },
    [onChange],
  );

  console.log('formData', formData);
  console.log('isAddModelValid(formData)', !isValid(formData));

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClosePanel}
      hasCloseButton
      headerText="New Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          <PrimaryButton onClick={onCreateOwnModel} disabled={isLoading} text="Add" />
          <DefaultButton onClick={onClosePanel}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!isLoading} />
      <Stack tokens={{ childrenGap: '10px' }}>
        <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Source</Label>
            <Text styles={{ root: classes.item }}>Uploaded</Text>
          </Stack>
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
            <Text styles={{ root: classes.item }}>False</Text>
          </Stack>
          <TextField
            label="Name"
            required
            errorMessage={isEmpty(formData.name) && errorMsg}
            onChange={(_, newValue) => onChange('name', newValue)}
          />
          <TextField
            label="Endpoint"
            value={formData.endPoint}
            errorMessage={isEmpty(formData.endPoint) && errorMsg}
            onChange={(_, newValue) => onChange('endPoint', newValue)}
            required
          />
          <Stack styles={{ root: { padding: '5px 0', display: 'block' } }}>
            <Label>Labels</Label>
            <DefaultButton
              text="Upload"
              iconProps={{ iconName: 'Upload' }}
              label="Labels"
              onClick={onUploadClick}
            />
            {fileName && <Label>{fileName}</Label>}
            <input ref={fileRef} type="file" onChange={onUpload} accept=".txt" style={{ display: 'none' }} />
          </Stack>
        </Stack>
      </Stack>
    </Panel>
  );
};

export default AddModelPanel;
