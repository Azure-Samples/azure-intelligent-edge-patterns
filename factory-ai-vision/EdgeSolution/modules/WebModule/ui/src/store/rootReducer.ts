import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';

import camerasReducer from './camera/cameraReducer';
import partReducer from './part/partReducer';
import labelingPageStateReducer from './labelingPage/labelingPageReducer';
import locationsReducer from './location/locationReducer';
import dialogIsOpenReducer from './dialog/dialogIsOpenReducer';
import projectReducer from './project/projectReducer';
import labelImagesReducer from './image/imageReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from './notification/notificationReducer';

const rootReducer = combineReducers({
  cameras: camerasReducer,
  locations: locationsReducer,
  part: partReducer,
  labelingPageState: labelingPageStateReducer,
  dialogIsOpen: dialogIsOpenReducer,
  project: projectReducer,
  images: labelImagesReducer,
  setting: settingReducer,
  notifications: notificationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
