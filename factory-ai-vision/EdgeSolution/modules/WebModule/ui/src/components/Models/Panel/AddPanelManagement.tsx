import React, { useCallback, useRef, useState } from 'react';
import {
  TextField,
  Stack,
  DefaultButton,
  Label,
  Dropdown,
  IDropdownOption,
  mergeStyleSets,
  Text,
  Link,
} from '@fluentui/react';
import { useSelector } from 'react-redux';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { CreateFormType, ModelType } from '../type';
import { getSource } from '../utils';

import Tag from '../Tag';

type CategoryType = 'Object Detection' | 'Classification';

interface Props {
  modelType: ModelType;
  formData: CreateFormType;
  errorMsg: string;
  onChange: (key: keyof CreateFormType, newValue: string | boolean | string[]) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (idx: number) => void;
  isExistingProject: boolean;
  onChangeExistingProject: () => void;
  onResetErrorMsg: () => void;
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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

const AddPanelManagement: React.FC<Props> = (props) => {
  const {
    modelType,
    formData,
    errorMsg,
    isExistingProject,
    onChangeExistingProject,
    onChange,
    onAddTag,
    onRemoveTag,
    onResetErrorMsg,
  } = props;

  const classes = getClasses();

  const customVisionProjectOptions = useSelector((state: RootState) =>
    state.setting.cvProjects.map((e) => ({ key: e.id, text: e.name })),
  );

  const [fileName, setFileName] = useState('');
  // const [isExisting, setIsExisting] = useState(false);
  const [tag, setTag] = useState('');

  const fileRef = useRef(null);

  // const typeOptions: IDropdownOption[] = [
  //   { key: 'custom', text: 'Custom Vision Model' },
  //   { key: 'own', text: 'Own Model' },
  //   { key: 'ovms', text: 'Ovms Model' },
  // ];

  const onProjectDropdownChange = (_, option: IDropdownOption) => {
    onChange('selectedCustomVisionId', option.key as string);
  };

  const onUploadClick = useCallback(() => {
    fileRef.current.click();
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

  const onChangeTag = useCallback(
    (newValue: string) => {
      onResetErrorMsg();
      setTag(newValue);
    },
    [onResetErrorMsg],
  );

  const onTagAdd = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && tag !== '') {
        onAddTag(tag);
        setTag('');
      }
    },
    [tag, onAddTag],
  );

  const onCategoryChange = useCallback(
    (_, option?: IDropdownOption) => {
      onChange('category', option!.key as string);
    },
    [onChange],
  );

  return (
    <>
      <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Source</Label>
          <Text styles={{ root: classes.item }}>{getSource(modelType)}</Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
          <Text styles={{ root: classes.item }}>{modelType === 'custom' ? 'True' : 'False'}</Text>
        </Stack>
        {modelType === 'ovms' && (
          <>
            <Stack>
              <Label styles={{ root: classes.itemTitle }}>Category</Label>
              <Text styles={{ root: classes.item }}>Object Detector</Text>
            </Stack>
            <Stack tokens={{ childrenGap: 5 }}>
              <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
              <Stack horizontal tokens={{ childrenGap: '5px' }} wrap>
                {['demo1', 'demo2'].map((tag, id) => (
                  <Tag id={id} text={tag} />
                ))}
              </Stack>
            </Stack>
          </>
        )}
        {/* <Stack>
               <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
               <Stack horizontal wrap>
                 {parts.map((part, id) => (
                   <Tag id={id} text={part.name} />
                 ))}
               </Stack>
             </Stack> */}
        {isExistingProject ? (
          <Dropdown
            label="Project"
            required
            options={customVisionProjectOptions}
            onChange={onProjectDropdownChange}
            selectedKey={formData.selectedCustomVisionId}
            calloutProps={{ calloutMaxHeight: 300 }}
            errorMessage={errorMsg}
          />
        ) : (
          <TextField
            label="Name"
            required
            errorMessage={isEmpty(formData.name) && errorMsg}
            onChange={(_, newValue) => onChange('name', newValue)}
          />
        )}
        {/* {modelType === 'custom' && (
          <>
            <Link onClick={onChangeExistingProject}>
              {isExistingProject ? 'Create new model >' : 'Create from existing project >'}
            </Link>
            <Dropdown
              label="Type"
              options={categoryOptions}
              selectedKey={formData.category}
              disabled={isExistingProject}
              onChange={onCategoryChange}
            />
          </>
        )} */}
        {modelType === 'custom' && !isExistingProject && (
          <Stack>
            <TextField
              label="Objects/Tags"
              required
              value={tag}
              onChange={(_, newValue) => onChangeTag(newValue)}
              onKeyPress={onTagAdd}
              errorMessage={errorMsg}
            />
            {
              <Stack>
                {formData.tags.length < 2 && (
                  <Text styles={{ root: classes.tip }}>Add at least 2 tags to Save</Text>
                )}
                <Stack horizontal wrap styles={{ root: { marginTop: '5px' } }} tokens={{ childrenGap: 8 }}>
                  {formData.tags.map((tag, id) => (
                    <Tag key={id} id={id} text={tag} isDelete onDelete={onRemoveTag} />
                  ))}
                </Stack>
              </Stack>
            }
          </Stack>
        )}
        {modelType === 'own' && (
          <>
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
              <input
                ref={fileRef}
                type="file"
                onChange={onUpload}
                accept=".txt"
                style={{ display: 'none' }}
              />
            </Stack>
          </>
        )}
      </Stack>
    </>
  );
};

export default AddPanelManagement;