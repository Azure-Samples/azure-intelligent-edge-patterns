import { combineReducers } from 'redux';
import camerasReducer from './cameras';
import partReducer from './part';
import labelingPageStateReducer from './labelingPage';

const rootReducer = combineReducers({
  cameras: camerasReducer,
  part: partReducer,
  labelingPageState: labelingPageStateReducer,
});
export default rootReducer;
