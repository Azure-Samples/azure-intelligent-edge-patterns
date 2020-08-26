import { applyMiddleware, createStore, Store } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { State } from './State';
import { rootReducer } from './rootReducer';
import { callAPIMiddleware } from '../middlewares/callAPIMiddleware';

const configureStore = (initialState: State): Store => {
  const middleWares = [thunkMiddleware, callAPIMiddleware];
  const middlewareEnhancer = applyMiddleware(...middleWares);
  const composedEnhancer = composeWithDevTools(middlewareEnhancer);

  return createStore(rootReducer, initialState, composedEnhancer);
};

export default configureStore;
