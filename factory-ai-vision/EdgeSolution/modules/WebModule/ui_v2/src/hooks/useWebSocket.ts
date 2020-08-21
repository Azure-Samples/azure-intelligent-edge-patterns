import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
// import { receiveNotification } from '../action/creators/notificationActionCreators';

export const useWebSocket = (): void => {
  const dispatch = useDispatch();

  useEffect(() => {
    const endPoint =
      process.env.NODE_ENV === 'development'
        ? `ws://${window.location.hostname}:8000/api/notifications/`
        : `ws://${window.location.hostname}:${window.location.port}/api/notifications/`;
    const ws = new WebSocket(endPoint);

    ws.onmessage = ({ data }): void => {
      console.log(data);
      const deSerializedData = JSON.parse(data);
      // TODO
      // dispatch(receiveNotification(deSerializedData));
    };

    ws.onerror = (evt): void => {
      console.error(evt);
    };

    return (): void => ws.close();
  }, [dispatch]);
};
