import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@fluentui/react-northstar';
import Axios from 'axios';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';
import { mainTheme } from './themes/mainTheme';
import TelemetryProvider from './components/TelemetryProvider';

const App: FC = (): JSX.Element => {
  const [appInsightInfo, setAppInsightInfo] = useState({
    key: '',
    isAppInsightOn: false,
  });

  useEffect(() => {
    const appInsightKey = Axios.get('/api/appinsight/key');
    const settings = Axios.get('/api/settings/');

    Axios.all([appInsightKey, settings])
      .then(
        Axios.spread((...responses) => {
          const { data: appInsightKeyData } = responses[0];
          const { data: settingsData } = responses[1];

          if (appInsightKeyData.key)
            return setAppInsightInfo({
              key: appInsightKeyData.key,
              isAppInsightOn: settingsData[0].is_collect_data,
            });
          throw new Error('No API Key');
        }),
      )
      .catch((e) => console.error(e));
  }, []);

  return (
    <Provider theme={mainTheme}>
      <BrowserRouter>
        <TelemetryProvider
          instrumentationKey={appInsightInfo.key}
          isAppInsightOn={appInsightInfo.isAppInsightOn}
        >
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
