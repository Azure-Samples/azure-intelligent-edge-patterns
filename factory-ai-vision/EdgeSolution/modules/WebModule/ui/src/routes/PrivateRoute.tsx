import React, { useEffect } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../store/State';
import { thunkGetSetting } from '../store/setting/settingAction';

export const PrivateRoute: React.FC<RouteProps> = ({ component, ...rest }) => {
  const isTrainerValid = useSelector<State, boolean>((state) => state.setting.isTrainerValid);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(thunkGetSetting());
  }, [dispatch]);

  if (isTrainerValid) return <Route {...rest} component={component} />;

  return <Route {...rest} render={() => <Redirect to="/setting" />} />;
};
