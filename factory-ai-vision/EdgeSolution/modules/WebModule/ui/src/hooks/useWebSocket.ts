import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { receiveNotification } from '../store/notificationSlice';

export const useWebSocket = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    const endPoint =
      process.env.NODE_ENV === 'development'
        ? `ws://${window.location.hostname}:8000/api/notifications/`
        : `ws://${window.location.hostname}:${window.location.port}/api/notifications/`;
    const ws = new WebSocket(endPoint);

    ws.onmessage = ({ data }): void => {
      const deSerializedData = JSON.parse(data);

      // For camera create setting
      if (deSerializedData.notification_type === 'upload') {
        alert(deSerializedData.details);
        window.location.reload();
      }

      dispatch(receiveNotification(deSerializedData));
    };

    ws.onerror = (evt): void => {
      console.error(evt);
    };

    return (): void => ws.close();
  }, [dispatch]);
};
