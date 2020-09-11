import { combineReducers } from '@reduxjs/toolkit';

import partsReducer from './partSlice';
import locationsReducer from './locationSlice';
import projectReducer from './project/projectReducer';
import settingReducer from './setting/settingReducer';
// import notificationReducer from '../reducers/notificationReducer';
import imagesReducer from './imageSlice';
import annotationReducer from './annotationSlice';
import labelingPageReducer from './labelingPageSlice';
import cameraReducer from './cameraSlice';
import videoAnnosReducer from './videoAnnoSlice';
import rejectMsgReducer from './rejectedReducer';
import trainingProjectReducer from './trainingProjectSlice';

export const rootReducer = combineReducers({
  project: projectReducer,
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
  videoAnnos: videoAnnosReducer,
  rejectMsg: rejectMsgReducer,
  trainingProject: trainingProjectReducer,
});
