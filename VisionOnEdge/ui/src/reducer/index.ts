import { combineReducers } from 'redux';
import camerasReducer from './cameras';

const rootReducer = combineReducers({ cameras: camerasReducer });
export default rootReducer;
