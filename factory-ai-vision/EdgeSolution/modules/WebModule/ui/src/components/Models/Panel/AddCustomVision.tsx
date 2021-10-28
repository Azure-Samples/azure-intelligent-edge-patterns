import React, { useState, useCallback } from 'react';
import {
  Panel,
  Stack,
  PrimaryButton,
  DefaultButton,
  ProgressIndicator,
  Label,
  Text,
  Dropdown,
  TextField,
  Link,
  mergeStyleSets,
  IDropdownOption,
} from '@fluentui/react';
import { assocPath } from 'ramda';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'ramda';

import {
  pullCVProjects,
  createCustomVisionProject,
  getSelectedProjectInfo,
  onEmptySelectedProjectInfo,
  ProjectType,
} from '../../../store/trainingProjectSlice';
import { ProjectInfo } from '../../../store/shared/DemoSliceUtils';
import { CreateCustomVisionForm } from '../type';

import Tag from '../Tag';

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

type Props = {
  isOpen: boolean;
  customVisionProjectOptions: IDropdownOption[];
  selectedProjectInfo: ProjectInfo;
  onDismiss: () => void;
};

const initialForm: CreateCustomVisionForm = {
  name: '',
  selectedCustomVisionId: '',
  tags: [],
  type: 'ObjectDetection',
  classification: 'Multiclass',
};

const typeOptions: IDropdownOption[] = [
  { key: 'ObjectDetection', text: 'Object Detection' },
  { key: 'Classification', text: 'Classification' },
];

const classificationTypeOptions: IDropdownOption[] = [
  { key: 'Multilabel', text: 'Multilabel' },
  { key: 'Multiclass', text: 'Multiclass' },
];

// const getAddOwnModelPayload = (formData: CreateCustomVisionForm): CreatOwnModelPayload => ({
//   is_prediction_module: true,
//   name: formData.name,
//   labels: formData.labels,
//   prediction_uri: formData.endPoint,
//   prediction_header: '',
// });

const isTagsFulfil = (type: ProjectType, tags: string[]): boolean => {
  if (type === 'ObjectDetection' && tags.length > 0) return true;
  if (type === 'Classification' && tags.length > 1) return true;
  return false;
};

const AddModelPanel: React.FC<Props> = (props) => {
  const { isOpen, onDismiss, customVisionProjectOptions, selectedProjectInfo } = props;

  const classes = getClasses();

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState<CreateCustomVisionForm>(initialForm);
  const [isExistingProject, setIsExistingProject] = useState(false);
  const [localTag, setLocalTag] = useState('');

  const dispatch = useDispatch();

  const onClosePanel = useCallback(() => {
    setIsExistingProject(false);
    setFormData(initialForm);
    onDismiss();
    setErrorMsg('');
    dispatch(onEmptySelectedProjectInfo());
  }, [onDismiss, dispatch]);

  const onCreateCustomVisionProject = useCallback(async () => {
    if (formData.name === '' || !isTagsFulfil(formData.type, formData.tags)) {
      setErrorMsg('This field is required');
      return;
    }

    setIsLoading(true);

    await dispatch(
      createCustomVisionProject({
        name: formData.name,
        project_type: formData.type,
        tags: formData.tags,
        classification_type: formData.classification,
      }),
    );

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

  const onChange = useCallback((key: keyof CreateCustomVisionForm, newValue: string | boolean) => {
    setErrorMsg('');

    setFormData(assocPath([key], newValue));
  }, []);

  const onProjectDropdownChange = useCallback(
    async (_, option: IDropdownOption) => {
      onChange('selectedCustomVisionId', option.key as string);
      setIsFetching(true);

      await dispatch(getSelectedProjectInfo(option.key as string));

      setIsFetching(false);
    },
    [dispatch, onChange],
  );

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

  const onCategoryChange = useCallback(
    (_, option?: IDropdownOption) => {
      onChange('type', option!.key as string);
    },
    [onChange],
  );

  const onClassificationCategoryChange = useCallback(
    (_, option?: IDropdownOption) => {
      onChange('classification', option!.key as string);
    },
    [onChange],
  );

  const onTagAdd = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && localTag !== '') {
        if (formData.tags.find((tag) => tag === localTag)) {
          setLocalTag('');
          return;
        }

        onAddTag(localTag);
        setLocalTag('');
        setErrorMsg('');
      }
    },
    [localTag, onAddTag, formData],
  );

  const onChangeTag = useCallback((v: string) => {
    setLocalTag(v);
    setErrorMsg('');
  }, []);

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClosePanel}
      hasCloseButton
      headerText="New Model"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 10 }} horizontal>
          <PrimaryButton
            onClick={isExistingProject ? onLoadExistingModel : onCreateCustomVisionProject}
            disabled={isLoading}
            text="Add"
          />
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
            <Text styles={{ root: classes.item }}>Microsoft Custom Vision</Text>
          </Stack>
          <Stack>
            <Label styles={{ root: classes.itemTitle }}>Trainable</Label>
            <Text styles={{ root: classes.item }}>True</Text>
          </Stack>
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
          <Link
            onClick={() => {
              if (isExistingProject) {
                setFormData((prev) => ({ ...prev, selectedCustomVisionId: '' }));
                dispatch(onEmptySelectedProjectInfo());
              }
              setIsExistingProject((prev) => !prev);
            }}
          >
            {isExistingProject ? 'Create new model >' : 'Create from existing project >'}
          </Link>
          {isFetching && <ProgressIndicator />}
          {!isFetching && (
            <>
              {isExistingProject && selectedProjectInfo !== null && (
                <>
                  <Dropdown
                    label="Type"
                    options={typeOptions}
                    selectedKey={selectedProjectInfo?.type}
                    disabled={true}
                  />
                  {selectedProjectInfo?.classification_type !== '' && (
                    <Dropdown
                      label="Classification Types"
                      options={classificationTypeOptions}
                      selectedKey={selectedProjectInfo?.classification_type}
                      disabled={true}
                    />
                  )}
                  <Stack horizontal wrap styles={{ root: { marginTop: '5px' } }} tokens={{ childrenGap: 8 }}>
                    {selectedProjectInfo?.tags?.map((tag, id) => (
                      <Tag key={id} id={id} text={tag} />
                    ))}
                  </Stack>
                </>
              )}
              {!isExistingProject && (
                <>
                  <Dropdown
                    label="Type"
                    options={typeOptions}
                    selectedKey={formData.type}
                    onChange={onCategoryChange}
                  />
                  {formData.type === 'Classification' && (
                    <Dropdown
                      label="Classification Types"
                      options={classificationTypeOptions}
                      selectedKey={formData.classification}
                      onChange={onClassificationCategoryChange}
                    />
                  )}
                  <Stack>
                    <TextField
                      label="Objects/Tags"
                      required
                      value={localTag}
                      onChange={(_, newValue) => onChangeTag(newValue)}
                      onKeyPress={onTagAdd}
                      errorMessage={errorMsg}
                    />
                    <Stack>
                      {formData.type === 'ObjectDetection' && formData.tags.length < 1 && (
                        <Text styles={{ root: classes.tip }}>Add at least 1 tags to Save</Text>
                      )}
                      {formData.type === 'Classification' && formData.tags.length < 2 && (
                        <Text styles={{ root: classes.tip }}>Add at least 2 tags to Save</Text>
                      )}
                      <Stack
                        horizontal
                        wrap
                        styles={{ root: { marginTop: '5px' } }}
                        tokens={{ childrenGap: 8 }}
                      >
                        {formData.tags.map((tag, id) => (
                          <Tag key={id} id={id} text={tag} isDelete onDelete={onRemoveTag} />
                        ))}
                      </Stack>
                    </Stack>
                  </Stack>
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Panel>
  );
};

export default AddModelPanel;
