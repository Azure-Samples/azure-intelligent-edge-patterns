import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@fluentui/react-northstar';
import Axios from 'axios';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';
import { myTheme } from './theme';
import TelemetryProvider from './components/TelemetryProvider';
import { getAppInsights } from './TelemetryService';

const App: FC = (): JSX.Element => {
  let appInsights = null;
  const [key, setKey] = useState('');

  useEffect(() => {
    Axios.get('http://localhost:8000/api/appinsight/key')
      .then(({ data }) => setKey(data.key))
      .catch((e) => console.error(e));
  }, []);

  return (
    <Provider theme={myTheme}>
      <BrowserRouter>
        <TelemetryProvider
          after={(): void => {
            appInsights = getAppInsights();
          }}
          instrumentationKey={key}
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
