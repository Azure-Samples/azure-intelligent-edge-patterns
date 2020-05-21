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

const rootReducer = combineReducers({
  cameras: camerasReducer,
  locations: locationsReducer,
  part: partReducer,
  labelingPageState: labelingPageStateReducer,
  dialogIsOpen: dialogIsOpenReducer,
  project: projectReducer,
  images: labelImagesReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
