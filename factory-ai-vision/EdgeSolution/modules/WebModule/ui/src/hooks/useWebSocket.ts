import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/notification/notificationAction';

export const useWebSocket = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/api/notifications/`);

    ws.onmessage = ({ data }): void => {
      const deSerializedData = JSON.parse(data);
      dispatch(
        addNotification({
          title: deSerializedData.title,
          content: deSerializedData.details,
          linkTo: '/partIdentification/',
        }),
      );
    };

    ws.onerror = (evt): void => {
      console.error(evt);
    };

    return (): void => ws.close();
  }, []);
};
