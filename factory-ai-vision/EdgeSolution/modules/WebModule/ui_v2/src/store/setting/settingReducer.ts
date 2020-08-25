import { SettingActionType, Setting } from './settingType';

const initialState = {
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
    case 'GET_ALL_CV_PROJECTS_REQUEST':
      return { ...state, loading: true };
    case 'GET_ALL_CV_PROJECTS_SUCCESS':
      return { ...state, loading: false, cvProjects: action.pyload };
    case 'GET_ALL_CV_PROJECTS_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

export default settingReducer;
