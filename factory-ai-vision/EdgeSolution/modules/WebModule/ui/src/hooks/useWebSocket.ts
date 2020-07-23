import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/notification/notificationAction';

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
