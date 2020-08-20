import React from 'react';
import { DetailsList, SelectionMode, CheckboxVisibility } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParts, Part } from '../../store/partSlice';
import { thunkChangeImgPart } from '../../store/imageSlice';

export const PartPicker: React.FC = () => {
  const parts = useSelector(selectAllParts);
  const dispatch = useDispatch();

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
