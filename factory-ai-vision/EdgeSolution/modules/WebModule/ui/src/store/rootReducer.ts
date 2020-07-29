import { combineReducers } from 'redux';

import camerasReducer from './camera/cameraReducer';
import partReducer from './part/partReducer';
import partsReducer from '../reducers/partReducer';
import labelingPageStateReducer from './labelingPage/labelingPageReducer';
import locationsReducer from '../reducers/locationReducer';
import dialogIsOpenReducer from './dialog/dialogIsOpenReducer';
import createProjectReducerByIsDemo from './project/projectReducer';
import labelImagesReducer from './image/imageReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from '../reducers/imageReducer';
import labelReducer from '../reducers/labelReducer';

export const rootReducer = combineReducers({
  cameras: camerasReducer,
  locations: locationsReducer,
  part: partReducer,
  labelingPageState: labelingPageStateReducer,
  dialogIsOpen: dialogIsOpenReducer,
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  images: labelImagesReducer,
  setting: settingReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  labels: labelReducer,
});
