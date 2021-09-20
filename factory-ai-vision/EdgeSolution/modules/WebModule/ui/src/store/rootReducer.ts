import { combineReducers } from '@reduxjs/toolkit';

import partsReducer from './partSlice';
import locationsReducer from './locationSlice';
import projectReducer from './project/projectReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from './notificationSlice';
import imagesReducer from './imageSlice';
import annotationReducer from './annotationSlice';
import labelingPageReducer from './labelingPageSlice';
import cameraReducer from './cameraSlice';
import videoAnnosReducer from './videoAnnoSlice';
import rejectMsgReducer from './rejectedReducer';
import trainingProjectReducer from './trainingProjectSlice';
import scenarioReducer from './scenarioSlice';
import cameraSettingReducer from './cameraSetting/cameraSettingReducer';
import cascadeReducer from './cascadeSlice';

import intelProjectReducer from './IntelProjectSlice';
import trainingProjectStatusReducer from './trainingProjectStatusSlice';

export const rootReducer = combineReducers({
  project: projectReducer,
  setting: settingReducer,
  camera: cameraReducer,
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
  videoAnnos: videoAnnosReducer,
  rejectMsg: rejectMsgReducer,
  trainingProject: trainingProjectReducer,
  scenario: scenarioReducer,
  cameraSetting: cameraSettingReducer,
  intelProject: intelProjectReducer,
  cascade: cascadeReducer,
  trainingProjectStatus: trainingProjectStatusReducer,
});
