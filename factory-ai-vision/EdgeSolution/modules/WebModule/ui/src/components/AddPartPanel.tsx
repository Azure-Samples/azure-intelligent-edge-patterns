import React, { useState, useCallback } from 'react';
import { Panel, TextField, Stack, PrimaryButton, DefaultButton, ProgressIndicator } from '@fluentui/react';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';

import {
  // postPart,
  postPartByProject,
  patchPart,
} from '../store/partSlice';

export enum PanelMode {
  Create,
  Update,
}

type AddEditPartPanelProps = {
  isOpen: boolean;
  onDissmiss: () => void;
  mode: PanelMode;
  initialValue?: Form;
  partId?: number;
  projectId?: number;
};

type FormData<V> = {
  value: V;
  errMsg: string;
};

type Form = {
  name: FormData<string>;
  description: FormData<string>;
};

const initialForm: Form = {
  name: { value: '', errMsg: '' },
  description: { value: '', errMsg: '' },
};

export const AddEditPartPanel: React.FC<AddEditPartPanelProps> = ({
  isOpen,
  onDissmiss,
  mode,
  initialValue = initialForm,
  partId,
  projectId,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Form>(initialValue);
  const dispatch = useDispatch();

  const validate = useCallback(() => {
    let hasError = false;

    Object.keys(formData).forEach((key) => {
      if (!formData[key].value) {
        setFormData(R.assocPath([key, 'errMsg'], `This field is required`));
        hasError = true;
      }
    });
    return hasError;
  }, [formData]);

  const onCreate = useCallback(async () => {
    if (validate()) return;

    setLoading(true);
    await dispatch(
      postPartByProject({
        project: projectId,
        data: {
          name: formData.name.value,
          description: formData.description.value,
        },
      }),
    );
    setFormData(initialForm);
    setLoading(false);
    onDissmiss();
  }, [dispatch, onDissmiss, formData, validate, projectId]);

  const onUpdate = useCallback(async () => {
    if (validate()) return;

    setLoading(true);

    await dispatch(
      patchPart({
        data: {
          name: formData.name.value,
          description: formData.description.value,
        },
        id: partId,
      }),
    );

    setLoading(false);
    onDissmiss();
  }, [dispatch, onDissmiss, formData, validate, partId]);

  const onClose = useCallback(() => {
    setFormData(initialForm);
    onDissmiss();
  }, [onDissmiss]);

  // const onConfirm = useCallback(async () => {
  //   if (validate()) return;

  //   setLoading(true);
  //   if (mode === PanelMode.Create) {
  //     await dispatch(
  //       postPart({
  //         name: formData.name.value,
  //         description: formData.description.value,
  //       }),
  //     );
  //     setFormData(initialForm);
  //   } else {
  //     await dispatch(
  //       patchPart({
  //         data: {
  //           name: formData.name.value,
  //           description: formData.description.value,
  //         },
  //         id: partId,
  //       }),
  //     );
  //   }
  //   setLoading(false);
  //   onDissmiss();
  // }, [partId, dispatch, formData.name.value, formData.description.value, mode, onDissmiss, validate]);

  // const onRenderFooterContent = useCallback(
  //   () => (
  //     <Stack tokens={{ childrenGap: 5 }} horizontal>
  //       {mode === PanelMode.Create && <PrimaryButton onClick={onCreate} disabled={loading} text="Add" />}
  //       {mode === PanelMode.Update && <PrimaryButton onClick={onUpdate} disabled={loading} text="Update" />}
  //       <DefaultButton onClick={onDissmiss}>Cancel</DefaultButton>
  //     </Stack>
  //   ),
  //   [loading, mode, onDissmiss],
  // );

  const onChange = (key: string) => (_, newValue) => {
    setFormData(R.assocPath([key, 'value'], newValue));
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClose}
      hasCloseButton
      headerText="Add Object"
      onRenderFooterContent={() => (
        <Stack tokens={{ childrenGap: 5 }} horizontal>
          {mode === PanelMode.Create && <PrimaryButton onClick={onCreate} disabled={loading} text="Add" />}
          {mode === PanelMode.Update && <PrimaryButton onClick={onUpdate} disabled={loading} text="Update" />}
          <DefaultButton onClick={onClose}>Cancel</DefaultButton>
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <ProgressIndicator progressHidden={!loading} />
      <TextField
        label="Object name"
        value={formData.name.value}
        errorMessage={formData.name.errMsg}
        onChange={onChange('name')}
        required
      />
      <TextField
        label="Description"
        value={formData.description.value}
        errorMessage={formData.description.errMsg}
        onChange={onChange('description')}
        multiline
      />
    </Panel>
  );
};
