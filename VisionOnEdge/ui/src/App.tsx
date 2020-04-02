import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider, themes } from '@fluentui/react-northstar';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';

const App: FC = (): JSX.Element => {
  return (
    <Provider theme={themes.teams}>
      <Router>
        <div className="App">
          <MainLayout>
            <RootRouter />
          </MainLayout>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
