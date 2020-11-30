import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DetailsList, CheckboxVisibility, Spinner, SpinnerSize } from '@fluentui/react';
import { createSelector } from '@reduxjs/toolkit';

import { getCameras, Camera, selectNonDemoCameras } from '../store/cameraSlice';
import { selectLocationEntities } from '../store/locationSlice';

import { maskRtsp } from '../utils/maskRTSP';
import { Url } from '../enums';

import { EmptyAddIcon } from './EmptyAddIcon';

const selectDetailListItems = createSelector(
  [selectNonDemoCameras, selectLocationEntities],
  (cameras, locations) => {
    return cameras.map((c) => ({
      ...c,
      location: locations[c.location]?.name ?? '',
      rtsp: maskRtsp(c.rtsp),
    }));
  },
);

export const CameraDetailList: React.FC<{ onAddBtnClick: () => void }> = ({ onAddBtnClick }) => {
  const [loading, setLoading] = useState(false);
  const cameras = useSelector(selectDetailListItems);

  const dispatch = useDispatch();
  const history = useHistory();

  const onRowClick = (item: Camera) => {
    history.push(`${Url.CAMERAS_DETAIL}?cameraId=${item.id}`);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getCameras(false));
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading) return <Spinner size={SpinnerSize.large} />;

  return (
    <>
      {cameras.length === 0 ? (
        <EmptyAddIcon
          title="Connect cameras"
          subTitle="Add and configure the cameras in the factory"
          primary={{ text: 'Add a camera', onClick: onAddBtnClick }}
        />
      ) : (
        <DetailsList
          columns={[
            { key: 'name', minWidth: 0, name: 'Name', fieldName: 'name' },
            { key: 'location', minWidth: 200, maxWidth: 200, name: 'Location', fieldName: 'location' },
            { key: 'rtsp', minWidth: 200, maxWidth: 200, name: 'RTSP URL', fieldName: 'rtsp' },
          ]}
          items={cameras}
          checkboxVisibility={CheckboxVisibility.hidden}
          onActiveItemChanged={onRowClick}
        />
      )}
    </>
  );
};
