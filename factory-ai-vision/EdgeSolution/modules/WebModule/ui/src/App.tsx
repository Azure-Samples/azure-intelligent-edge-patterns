import React, { FC, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'RootStateType';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';
import { mainTheme } from './themes/mainTheme';
import TelemetryProvider from './components/TelemetryProvider';
import { useWebSocket } from './hooks/useWebSocket';
import { thunkGetSettingAndAppInsightKey } from './store/setting/settingAction';

const App: FC = (): JSX.Element => {
  // Listen for the notification boardcast.
  useWebSocket();

  const dispatch = useDispatch();
  const appInsightKey = useSelector<State, string>((state) => state.setting.appInsightKey);
  const isAppInsightOn = useSelector<State, boolean>((state) => state.setting.isCollectData);

  useEffect(() => {
    dispatch(thunkGetSettingAndAppInsightKey());
  }, [dispatch]);

  return (
    <Provider theme={mainTheme}>
      <BrowserRouter>
        <TelemetryProvider instrumentationKey={appInsightKey} isAppInsightOn={isAppInsightOn}>
          <div className="App">
            <MainLayout>
              <RootRouter />
            </MainLayout>
          </div>
        </TelemetryProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
