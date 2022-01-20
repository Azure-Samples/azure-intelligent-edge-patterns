import { SettingActionType, Setting } from './settingType';
import { patchIsCollectData } from './settingAction';
import { createNewTrainingProject } from '../trainingProjectSlice';

export const initialState: Setting = {
  loading: false,
  error: null,
  current: {
    id: -1,
    key: '',
    namespace: '',
  },
  origin: {
    id: -1,
    key: '',
    namespace: '',
  },
  isTrainerValid: true,
  appInsightHasInit: true,
  isCollectData: false,
  appInsightKey: '',
  cvProjects: [],
};

const settingReducer = (state = initialState, action: SettingActionType): Setting => {
  switch (action.type) {
    case 'UPDATE_KEY':
      return { ...state, current: { ...state.current, key: action.payload } };
    case 'UPDATE_NAMESPACE':
      return { ...state, current: { ...state.current, namespace: action.payload } };
    case 'REQUEST_START':
      return { ...state, loading: true };
    case 'REQUEST_SUCCESS':
      return action.payload;
    case 'REQUEST_FAIL':
      return { ...state, error: action.error };
    case 'settings/listAllProjects/pending':
      return { ...state, loading: true };
    case 'settings/listAllProjects/fulfilled':
      return { ...state, loading: false, cvProjects: action.pyload };
    case 'settings/listAllProjects/rejected':
      return { ...state, loading: false, error: action.error };
    case createNewTrainingProject.fulfilled.toString():
      return {
        ...state,
        loading: false,
        cvProjects: [
          ...state.cvProjects,
          { id: (action as any).payload.customVisionId, name: (action as any).payload.name },
        ],
      };
    case patchIsCollectData.pending.toString():
      return { ...state, isCollectData: (action as any).meta.arg.isCollectData, appInsightHasInit: true };
    case patchIsCollectData.rejected.toString():
      return { ...state, isCollectData: !(action as any).meta.arg.isCollectData };
    default:
      return state;
  }
};

export default settingReducer;
