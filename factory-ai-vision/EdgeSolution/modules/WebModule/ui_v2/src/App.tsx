import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { MainLayout } from './components/MainLayout';
import { RootRouter } from './routes/RootRouter';
import TelemetryProvider from './components/TelemetryProvider';
import { useWebSocket } from './hooks/useWebSocket';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'RootStateType';
import { thunkGetSettingAndAppInsightKey } from './store/setting/settingAction';

function App() {
  // Listen for the notification boardcast.
  useWebSocket();

  const dispatch = useDispatch();
  const appInsightKey = useSelector<State, string>((state) => state.setting.appInsightKey);
  const isAppInsightOn = useSelector<State, boolean>((state) => state.setting.isCollectData);

  useEffect(() => {
    dispatch(thunkGetSettingAndAppInsightKey());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <TelemetryProvider instrumentationKey={appInsightKey} isAppInsightOn={isAppInsightOn}>
        <MainLayout>
          <RootRouter />
        </MainLayout>
      </TelemetryProvider>
    </BrowserRouter>
  );
}

export default App;
