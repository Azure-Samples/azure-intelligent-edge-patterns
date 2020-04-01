import { combineReducers } from 'redux';
import camerasReducer from './cameras';
import partReducer from './part';

const rootReducer = combineReducers({ cameras: camerasReducer, part: partReducer });
export default rootReducer;
