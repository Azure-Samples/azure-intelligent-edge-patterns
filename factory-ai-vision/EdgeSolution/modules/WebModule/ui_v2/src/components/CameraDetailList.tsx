import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DetailsList, CheckboxVisibility, Spinner, SpinnerSize } from '@fluentui/react';

import { getCameras, Camera, selectAllCamerasWithLocation } from '../store/cameraSlice';
import { EmptyAddIcon } from './EmptyAddIcon';

export const CameraDetailList: React.FC<{ onAddBtnClick: () => void }> = ({ onAddBtnClick }) => {
  const [loading, setLoading] = useState(false);
  const cameras = useSelector(selectAllCamerasWithLocation);

  const dispatch = useDispatch();
  const history = useHistory();

  const onRowClick = (item: Camera) => {
    history.push(`/cameras/detail?cameraId=${item.id}`);
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
          text="Add and configure the cameras in the factory"
          btnTxt="Add a camera"
          onAddBtnClick={onAddBtnClick}
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
