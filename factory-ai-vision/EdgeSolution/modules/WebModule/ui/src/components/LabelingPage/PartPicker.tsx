import React, { useEffect, useState, useMemo } from 'react';
import { DetailsList, SelectionMode, CheckboxVisibility, Text, TextField } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { Part, getParts, postPart, trainingProjectPartsSelectorFactory } from '../../store/partSlice';
import { changePartId } from '../../store/labelingPageSlice';

interface Props {
  trainingProject: number;
}

export const PartPicker: React.FC<Props> = (props) => {
  const { trainingProject } = props;

  const partOptionsSelector = useMemo(() => trainingProjectPartsSelectorFactory(trainingProject), [
    trainingProject,
  ]);
  // const partOptions = useSelector(partOptionsSelector);
  const parts = useSelector(partOptionsSelector);

  const dispatch = useDispatch();

  const [newPartName, setNewPartName] = useState('');
  const onTextFieldChange = (_, newValue: string) => {
    setNewPartName(newValue);
  };

  const onTextFieldEnter = async (evt: React.KeyboardEvent) => {
    if (evt.nativeEvent.code === 'Enter') {
      await dispatch(postPart({ name: newPartName, description: '', project: trainingProject }));
      setNewPartName('');
    }
  };

  useEffect(() => {
    dispatch(getParts());
  }, [dispatch]);

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
        onActiveItemChanged={(item: Part): void => {
          dispatch(changePartId({ partId: item.id }));
        }}
      />
    );
  };

  return (
    <div>
      <TextField
        label="What is this?"
        placeholder="Enter an object name"
        value={newPartName}
        onChange={onTextFieldChange}
        onKeyDown={onTextFieldEnter}
      />
      {renderPartList()}
    </div>
  );
};
