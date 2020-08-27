import { combineReducers } from '@reduxjs/toolkit';

import partsReducer from './partSlice';
import locationsReducer from './locationSlice';
import createProjectReducerByIsDemo from './project/projectReducer';
import settingReducer from './setting/settingReducer';
// import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from './imageSlice';
import annotationReducer from './annotationSlice';
import labelingPageReducer from './labelingPageSlice';
import cameraReducer from './cameraSlice';
import AOIsReducer from './AOISlice';
import rejectMsgReducer from './rejectedReducer';
import trainingProjectReducer from './trainingProjectSlice';

export const rootReducer = combineReducers({
  project: createProjectReducerByIsDemo(false),
  demoProject: createProjectReducerByIsDemo(true),
  setting: settingReducer,
  // The Below state has been refactor
  camera: cameraReducer,
  locations: locationsReducer,
  // TODO
  // notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
  AOIs: AOIsReducer,
  rejectMsg: rejectMsgReducer,
  trainingProject: trainingProjectReducer,
});
