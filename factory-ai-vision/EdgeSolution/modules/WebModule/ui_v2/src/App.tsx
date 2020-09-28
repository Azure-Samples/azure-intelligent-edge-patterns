import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { MainLayout } from './components/MainLayout';
import { RootRouter } from './routes/RootRouter';
import TelemetryProvider from './components/TelemetryProvider';
import { useWebSocket } from './hooks/useWebSocket';
import { thunkGetSettingAndAppInsightKey } from './store/setting/settingAction';
import { thunkGetProject } from './store/project/projectActions';
import { getTrainingProject } from './store/trainingProjectSlice';
import { clearRejectMsg } from './store/rejectedReducer';

function App() {
  // Listen for the notification boardcast.
  useWebSocket();

  const dispatch = useDispatch();
  const appInsightKey = useSelector<State, string>((state) => state.setting.appInsightKey);
  const isAppInsightOn = useSelector<State, boolean>((state) => state.setting.isCollectData);
  const rejectMsg = useSelector((state: State) => state.rejectMsg);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(thunkGetSettingAndAppInsightKey()),
        dispatch(thunkGetProject()),
        dispatch(getTrainingProject(false)),
      ]);
      setloading(false);
    })();
  }, [dispatch]);

  useEffect(() => {
    initializeIcons(/* optional base url */);
  }, []);

  useEffect(() => {
    if (rejectMsg) {
      alert(rejectMsg);
      dispatch(clearRejectMsg());
    }
  }, [dispatch, rejectMsg]);

  if (loading) return <h1>Loading...</h1>;

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
