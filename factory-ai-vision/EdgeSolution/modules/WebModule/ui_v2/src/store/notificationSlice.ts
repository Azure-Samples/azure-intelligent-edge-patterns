import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Notification = {
  id: number;
  title: string;
  content: string;
  linkTo: string;
  unRead: boolean;
};
const entityAdapter = createEntityAdapter<Notification>();

export const getNotifications = createWrappedAsync(
  'notifications/get',
  async () => {
    const response = await Axios.get('/api/notifications/');
    return response.data;
  },
  { conditions: (_, { getState }) => !getState().notifications.ids.length },
);

export const deleteNotification = createWrappedAsync<any, number>('notifications/delete', async (id) => {
  await Axios.delete(`/api/notifications/${id}/`);
  return id;
});

export const clearAllNotifications = createWrappedAsync('notifications/clearAll', async () => {
  await Axios.delete(`/api/notifications/delete_all/`);
});

const getLinkByNotificationType = (notificationType: string): string => {
  if (notificationType) {
    return '/home/deployment';
  }
  return '';
};

const getNormalizeNotification = (response: any, unRead: boolean): Notification => ({
  id: response.id,
  title: response.title,
  content: response.details,
  linkTo: getLinkByNotificationType(response.notification_type),
  unRead,
});

const slice = createSlice({
  name: 'notifications',
  initialState: entityAdapter.getInitialState(),
  reducers: {
    receiveNotification: (state, action) => {
      entityAdapter.addOne(state, getNormalizeNotification(action.payload, true));
    },
    openNotificationPanel: (state) => {
      state.ids.forEach((id) => {
        state.entities[id].unRead = false;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.fulfilled, (state, action) => {
        entityAdapter.setAll(
          state,
          action.payload.map((e) => getNormalizeNotification(e, false)),
        );
      })
      .addCase(deleteNotification.fulfilled, entityAdapter.removeOne)
      .addCase(clearAllNotifications.fulfilled, () => entityAdapter.getInitialState());
  },
});

const { reducer } = slice;
export default reducer;

export const { receiveNotification, openNotificationPanel } = slice.actions;

export const { selectAll: selectAllNotifications } = entityAdapter.getSelectors(
  (state: State) => state.notifications,
);

export const selectUnreadNotification = createSelector(selectAllNotifications, (notifications) =>
  notifications.filter((n) => n.unRead),
);
