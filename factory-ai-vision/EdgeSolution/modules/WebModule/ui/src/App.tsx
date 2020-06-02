import React, { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from '@fluentui/react-northstar';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';
import { myTheme } from './theme';
import TelemetryProvider from './components/TelemetryProvider';
import { getAppInsights } from './TelemetryService';

const App: FC = (): JSX.Element => {
  let appInsights = null;

  return (
    <Provider theme={myTheme}>
      <BrowserRouter>
        <TelemetryProvider
          after={(): void => {
            appInsights = getAppInsights();
          }}
          instrumentationKey="97824aa6-ebbc-4d2a-b9a1-2fdde7d77fcc"
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
