import React from 'react';
import { DetailsList, SelectionMode, CheckboxVisibility, Text } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParts, Part } from '../../store/partSlice';
import { thunkChangeImgPart } from '../../store/imageSlice';

export const PartPicker: React.FC = () => {
  const parts = useSelector(selectAllParts);
  const dispatch = useDispatch();

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
          No tags have been found
        </Text>
        <Text styles={{ root: { textAlign: 'center', width: '60%' } }} variant="medium">
          Enter a part above and press enter to create a tag
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
        dispatch(thunkChangeImgPart(item.id));
      }}
    />
  );
};
