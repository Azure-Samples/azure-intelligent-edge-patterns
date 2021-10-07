import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DetailsList, CheckboxVisibility, Spinner, SpinnerSize } from '@fluentui/react';

import { getParts, Part } from '../../store/partSlice';
import { selectNonDemoPart } from '../../store/selectors';

import { Url } from '../../constant';

import { EmptyAddIcon } from '../EmptyAddIcon';

export const PartDetailList: React.FC<{ onAddBtnClick: () => void }> = ({ onAddBtnClick }) => {
  const [loading, setLoading] = useState(false);
  const parts = useSelector(selectNonDemoPart);

  const dispatch = useDispatch();
  const history = useHistory();

  const onRowClick = (item: Part) => {
    history.push(`${Url.PARTS_DETAIL}?partId=${item.id}`);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getParts());
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading) return <Spinner size={SpinnerSize.large} />;

  return (
    <>
      {parts.length === 0 ? (
        <EmptyAddIcon
          subTitle="Add a object to tag your photo"
          title="Add a tag"
          primary={{ text: 'Add a object', onClick: onAddBtnClick }}
        />
      ) : (
        <DetailsList
          columns={[{ key: 'name', minWidth: 0, name: 'Name', fieldName: 'name' }]}
          items={parts}
          checkboxVisibility={CheckboxVisibility.hidden}
          onActiveItemChanged={onRowClick}
        />
      )}
    </>
  );
};
