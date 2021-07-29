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
    tagsWrapper: {
      marginTop: '20px',
    },
  });

const AddPanelManagement: React.FC<Props> = (props) => {
  const { modelType, formData, onChange, errorMsg, onAddTag, onRemoveTag } = props;

  const classes = getClasses();

  const customVisionProjectOptions = useSelector((state: RootState) =>
    state.setting.cvProjects.map((e) => ({ key: e.id, text: e.name })),
  );

  const [fileName, setFileName] = useState('');
  const [isExisting, setIsExisting] = useState(false);
  const [tag, setTag] = useState('');

  const fileRef = useRef(null);

  // const typeOptions: IDropdownOption[] = [
  //   { key: 'custom', text: 'Custom Vision Model' },
  //   { key: 'own', text: 'Own Model' },
  //   { key: 'ovms', text: 'Ovms Model' },
  // ];

  const categoryOptions: IDropdownOption[] = [
    { key: 'object', text: 'Object Detection' },
    { key: 'classification', text: 'Classification' },
  ];

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

  const onChangeTag = useCallback((newValue: string) => {
    setTag(newValue);
  }, []);

  const onTagAdd = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && tag !== '') {
        onAddTag(tag);
        setTag('');
      }
    },
    [tag, onAddTag],
  );

  const onCategoryChange = useCallback((_, option?: IDropdownOption) => {
    onChange('category', option!.key as string);
  }, []);

  // const onDeleteTag = useCallback((id: number) => {}, [tag, onAddTag]);

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
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Category</Label>
            <Text styles={{ root: classes.item }}>Category</Text>
          </Stack>
        )}
        {/* <Stack>
               <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
               <Stack horizontal wrap>
                 {parts.map((part, id) => (
                   <Tag id={id} text={part.name} />
                 ))}
               </Stack>
             </Stack> */}
        {isExisting ? (
          <Dropdown
            label="Project"
            required
            options={customVisionProjectOptions}
            onChange={onProjectDropdownChange}
            selectedKey={formData.selectedCustomVisionId}
            calloutProps={{ calloutMaxHeight: 300 }}
          />
        ) : (
          <TextField
            label="Name"
            required
            errorMessage={isEmpty(formData.name) && errorMsg}
            onChange={(_, newValue) => onChange('name', newValue)}
          />
        )}
        {modelType === 'custom' && (
          <>
            <Link onClick={() => setIsExisting(true)}>Create from existing project &gt;</Link>
            <Dropdown
              label="Type"
              options={categoryOptions}
              selectedKey={formData.category}
              disabled={isExisting}
              onChange={onCategoryChange}
            />
          </>
        )}
        {modelType === 'custom' && !isExisting && (
          <>
            <TextField
              label="Objects/Tags"
              required
              value={tag}
              onChange={(_, newValue) => onChangeTag(newValue)}
              onKeyPress={onTagAdd}
            />
            {
              <Stack horizontal wrap tokens={{ childrenGap: 5 }}>
                {formData.tags.map((tag, id) => (
                  <Tag id={id} text={tag} isDelete onDelete={onRemoveTag} />
                ))}
              </Stack>
            }
          </>
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

  // switch (modelType) {
  //   case 'custom':
  //     return (
  //       <>
  //         <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Source</Label>
  //             <Text styles={{ root: classes.item }}>{getSource('custom')}</Text>
  //           </Stack>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
  //             <Text styles={{ root: classes.item }}>True</Text>
  //           </Stack>
  //         </Stack>
  //         <TextField
  //           label="Name"
  //           required
  //           errorMessage={isEmpty(formData.name) && errorMsg}
  //           onChange={(_, newValue) => onChange('name', newValue)}
  //         />
  //         <Dropdown
  //           label="Project"
  //           required
  //           options={customVisionProjectOptions}
  //           onChange={onProjectDropdownChange}
  //           selectedKey={formData.selectedCustomVisionId}
  //           calloutProps={{ calloutMaxHeight: 300 }}
  //         />
  //         <Dropdown label="Type" options={typeOptions} selectedKey={'custom' as ModelType} disabled />
  //         <Dropdown
  //           label="Category"
  //           options={categoryOptions}
  //           selectedKey={'Object Detection' as CategoryType}
  //           disabled
  //         />
  //         <TextField label="Objects/Tags" required onChange={(_, newValue) => onChange('name', newValue)} />
  //         {/* <CreateProjectDialog /> */}
  //         {/* <Checkbox checked={isFullImages} label="Load Full Images" onChange={onLoadFullImgChange} />
  //         <WarningDialog
  //           open={isLoadingImages}
  //           contentText={
  //             <Text variant="large">Depends on the number of images, loading full images takes time</Text>
  //           }
  //           onConfirm={() => {
  //             setIsFullImages(true);
  //             setIsLoadingImages(false);
  //           }}
  //           onCancel={() => setIsLoadingImages(false)}
  //         /> */}
  //         {/* <Stack horizontal tokens={{ childrenGap: 10 }}>
  //         <PrimaryButton text="Load" disabled={isLoading} onClick={onLoadModel} />
  //         {isLoading && <Spinner label="loading" />}
  //       </Stack> */}
  //       </>
  //     );
  //   case 'ovms':
  //     return (
  //       <>
  //         <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Source</Label>
  //             <Text styles={{ root: classes.item }}>{getSource('ovms')}</Text>
  //           </Stack>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
  //             <Text styles={{ root: classes.item }}>False</Text>
  //           </Stack>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Category</Label>
  //             <Text styles={{ root: classes.item }}>Category</Text>
  //           </Stack>
  //           {/* <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Object / Tags</Label>
  //             <Stack horizontal wrap>
  //               {parts.map((part, id) => (
  //                 <Tag id={id} text={part.name} />
  //               ))}
  //             </Stack>
  //           </Stack> */}
  //         </Stack>
  //         <TextField
  //           label="Name"
  //           required
  //           errorMessage={isEmpty(formData.name) && errorMsg}
  //           onChange={(_, newValue) => onChange('name', newValue)}
  //         />
  //       </>
  //     );
  //   case 'own':
  //     return (
  //       <>
  //         <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Source</Label>
  //             <Text styles={{ root: classes.item }}>{getSource('own')}</Text>
  //           </Stack>
  //           <Stack>
  //             <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
  //             <Text styles={{ root: classes.item }}>False</Text>
  //           </Stack>
  //         </Stack>
  //         <TextField
  //           label="Name"
  //           required
  //           errorMessage={isEmpty(formData.name) && errorMsg}
  //           onChange={(_, newValue) => onChange('name', newValue)}
  //         />
  //         <TextField
  //           label="Endpoint"
  //           value={formData.endPoint}
  //           errorMessage={isEmpty(formData.endPoint) && errorMsg}
  //           onChange={(_, newValue) => onChange('endPoint', newValue)}
  //           required
  //         />
  //         <Stack styles={{ root: { padding: '5px 0', display: 'block' } }}>
  //           <Label>Labels</Label>
  //           <DefaultButton
  //             text="Upload"
  //             iconProps={{ iconName: 'Upload' }}
  //             label="Labels"
  //             onClick={onUploadClick}
  //           />
  //           {fileName && <Label>{fileName}</Label>}
  //           <input ref={fileRef} type="file" onChange={onUpload} accept=".txt" style={{ display: 'none' }} />
  //         </Stack>
  //       </>
  //     );
  //   default:
  //     break;
  // }
};

export default AddPanelManagement;
