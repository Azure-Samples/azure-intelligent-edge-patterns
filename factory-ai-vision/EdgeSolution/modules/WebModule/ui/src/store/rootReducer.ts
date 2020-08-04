import { combineReducers } from 'redux';

import camerasReducer from './camera/cameraReducer';
import partReducer from './part/partReducer';
import partsReducer from '../features/partSlice';
import labelingPageStateReducer from './labelingPage/labelingPageReducer';
import locationsReducer from '../features/locationSlice';
import dialogIsOpenReducer from './dialog/dialogIsOpenReducer';
import createProjectReducerByIsDemo from './project/projectReducer';
import labelImagesReducer from './image/imageReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from '../features/imageSlice';
import labelReducer from '../reducers/labelReducer';
import labelingPageReducer from '../features/labelingPageSlice';

export const rootReducer = combineReducers({
  cameras: camerasReducer,
  part: partReducer,
  labelingPageState: labelingPageStateReducer,
  dialogIsOpen: dialogIsOpenReducer,
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  images: labelImagesReducer,
  setting: settingReducer,
  // The Below state has been refactor
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  labels: labelReducer,
  labelingPage: labelingPageReducer,
});
