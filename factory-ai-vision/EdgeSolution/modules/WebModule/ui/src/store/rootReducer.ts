import { combineReducers } from '@reduxjs/toolkit';

import camerasReducer from './camera/cameraReducer';
import partsReducer from '../store/partSlice';
import locationsReducer from '../store/locationSlice';
import createProjectReducerByIsDemo from './project/projectReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from '../store/imageSlice';
import annotationReducer from '../store/annotationSlice';
import labelingPageReducer from '../store/labelingPageSlice';

export const rootReducer = combineReducers({
  cameras: camerasReducer,
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  setting: settingReducer,
  // The Below state has been refactor
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
});
