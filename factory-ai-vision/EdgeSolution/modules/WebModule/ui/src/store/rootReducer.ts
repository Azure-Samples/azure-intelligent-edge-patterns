import { combineReducers } from '@reduxjs/toolkit';

import camerasReducer from './camera/cameraReducer';
import partsReducer from './partSlice';
import locationsReducer from './locationSlice';
import createProjectReducerByIsDemo from './project/projectReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from './imageSlice';
import annotationReducer from './annotationSlice';
import labelingPageReducer from './labelingPageSlice';
import cameraReducer from './cameraSlice';

export const rootReducer = combineReducers({
  cameras: camerasReducer,
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  setting: settingReducer,
  // The Below state has been refactor
  camera: cameraReducer,
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
});
