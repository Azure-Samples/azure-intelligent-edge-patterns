import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from '@fluentui/react-northstar';
import { RootRouter } from './routes/RootRouter';
import { MainLayout } from './components/MainLayout';
import { myTheme } from './theme';

const App: FC = (): JSX.Element => {
  return (
    <Provider theme={myTheme}>
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
