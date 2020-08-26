import { combineReducers } from 'redux';

import camerasReducer from './camera/cameraReducer';
import partReducer from './part/partReducer';
import labelingPageStateReducer from './labelingPage/labelingPageReducer';
import locationsReducer from './location/locationReducer';
import dialogIsOpenReducer from './dialog/dialogIsOpenReducer';
import createProjectReducerByIsDemo from './project/projectReducer';
import labelImagesReducer from './image/imageReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from './notification/notificationReducer';

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
});
