import React, {
  useEffect,
  //  useState,
  useMemo,
  useCallback,
} from 'react';
import { DetailsList, SelectionMode, CheckboxVisibility, Text } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import {
  Part,
  getParts,
  //  postPart,
  trainingProjectPartsSelectorFactory,
} from '../../store/partSlice';
import { changePartId } from '../../store/labelingPageSlice';
import { TrainingProject } from '../../store/trainingProjectSlice';
import { createClassification, updateAnnotation } from '../../store/annotationSlice';
import { Annotation } from '../../store/type';
import { theme } from '../../constant/theme';

interface Props {
  trainingProject: TrainingProject;
  selectedImageId: number;
  annotationList: Annotation[];
}

export const PartPicker: React.FC<Props> = (props) => {
  const { trainingProject, selectedImageId, annotationList } = props;

  const partOptionsSelector = useMemo(() => trainingProjectPartsSelectorFactory(trainingProject.id), [
    trainingProject,
  ]);
  // const partOptions = useSelector(partOptionsSelector);
  const parts = useSelector(partOptionsSelector);

  const dispatch = useDispatch();

  // const [newPartName, setNewPartName] = useState('');

  useEffect(() => {
    dispatch(getParts());
  }, [dispatch]);

  // const onTextFieldChange = (_, newValue: string) => {
  //   setNewPartName(newValue);
  // };

  // const onTextFieldEnter = async (evt: React.KeyboardEvent) => {
  //   if (evt.nativeEvent.code === 'Enter') {
  //     await dispatch(postPart({ name: newPartName, description: '', project: trainingProject.id }));
  //     setNewPartName('');
  //   }
  // };

  const onChangePart = useCallback(
    (item: Part) => {
      dispatch(changePartId({ partId: item.id }));
    },
    [dispatch],
  );

  const onSaveClassification = useCallback(
    async (item: Part) => {
      if (annotationList.find((anno) => anno.part === item.id)) return;

      if (trainingProject.classification_type === 'Multiclass' && annotationList.length > 0) {
        const anno: Annotation = annotationList[0];
        await dispatch(updateAnnotation({ id: anno.id, changes: { ...anno, part: item.id } }));
      } else {
        await dispatch(createClassification({ x: -100, y: -100 }, selectedImageId, item.id));
      }
    },
    [dispatch, selectedImageId, annotationList, trainingProject],
  );

  const renderPartList = () => {
    if (parts.length === 0)
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Text styles={{ root: { fontWeight: 'bold' } }} variant="large">
            No objects have been added
          </Text>
          <Text styles={{ root: { textAlign: 'center', width: '60%' } }} variant="medium">
            Enter an object above and press enter to create the tag
          </Text>
        </div>
      );

    return (
      <DetailsList
        setKey="items"
        items={parts}
        columns={[
          {
            key: 'part',
            minWidth: 0,
            name: 'Part',
          },
        ]}
        checkboxVisibility={CheckboxVisibility.hidden}
        selectionMode={SelectionMode.single}
        onRenderItemColumn={(item) => item.name}
        isHeaderVisible={false}
        onActiveItemChanged={(item: Part) => {
          trainingProject.projectType === 'Classification' ? onSaveClassification(item) : onChangePart(item);
        }}
      />
    );
  };

  return (
    <div>
      <Text
        styles={{
          root: {
            fontWeight: 600,
            lineHeight: '20px',
            fontSize: '16px',
            backgroundColor: theme.palette.neutralLighter,
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
          },
        }}
      >
        Select a part
      </Text>
      {renderPartList()}
    </div>
  );
};
