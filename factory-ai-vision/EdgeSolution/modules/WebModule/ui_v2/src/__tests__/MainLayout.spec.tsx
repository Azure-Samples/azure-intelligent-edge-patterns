import { configureStore } from '@reduxjs/toolkit';
import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { MainLayout } from '../components/MainLayout';
import { rootReducer } from '../store/rootReducer';
import { initialState as initialSetting } from '../store/setting/settingReducer';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'test/test/test',
  }),
}));

jest.mock('axios');

function render(
  ui,
  {
    initialState = undefined,
    store = configureStore({ reducer: rootReducer, preloadedState: initialState }),
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
}

test('The setting panel should be open if `isTranerValid` is false.', () => {
  const { getByText } = render(<MainLayout />, {
    initialState: { setting: { ...initialSetting, isTrainerValid: false } },
  });

  expect(getByText(/Settings/)).not.toBeNull();
});

test("The project dropdown shouldn't be shown when `isTrainerValid` is false", () => {
  const { queryByText } = render(<MainLayout />, {
    initialState: { setting: { ...initialSetting, isTrainerValid: false } },
  });
  expect(queryByText(/Project/)).toBeNull();
});

test('The data policy dialog should be shown when the app is initialized', () => {
  const { getByText } = render(<MainLayout />, {
    initialState: { setting: { ...initialSetting, isTrainerValid: false, appInsightHasInit: false } },
  });
  expect(getByText(/Data Collection Policy/)).not.toBeNull();
});
