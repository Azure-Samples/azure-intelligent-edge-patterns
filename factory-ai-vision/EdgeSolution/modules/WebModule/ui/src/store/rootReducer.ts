import { combineReducers } from 'redux';

import camerasReducer from './camera/cameraReducer';
import partsReducer from '../features/partSlice';
import locationsReducer from '../features/locationSlice';
import createProjectReducerByIsDemo from './project/projectReducer';
import labelImagesReducer from './image/imageReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from '../features/imageSlice';
import annotationReducer from '../features/annotationSlice';
import labelingPageReducer from '../features/labelingPageSlice';

export const rootReducer = combineReducers({
  cameras: camerasReducer,
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  images: labelImagesReducer,
  setting: settingReducer,
  // The Below state has been refactor
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
});
