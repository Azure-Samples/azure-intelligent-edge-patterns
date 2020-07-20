import React, { useEffect } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../store/State';
import { thunkGetSetting } from '../store/setting/settingAction';
import { Setting } from '../store/setting/settingType';

export const PrivateRoute: React.FC<RouteProps> = ({ component, ...rest }) => {
  const { isTrainerValid, appInsightHasInit } = useSelector<State, Setting>((state) => state.setting);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(thunkGetSetting());
  }, [dispatch]);

  if (isTrainerValid && appInsightHasInit) return <Route {...rest} component={component} />;

  return <Route {...rest} render={(): JSX.Element => <Redirect to="/setting" />} />;
};
