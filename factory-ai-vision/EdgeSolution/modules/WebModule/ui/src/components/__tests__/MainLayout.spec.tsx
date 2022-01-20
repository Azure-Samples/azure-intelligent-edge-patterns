import React from 'react';

import { MainLayout } from '../MainLayout';
import { initialState as initialSetting } from '../../store/setting/settingReducer';
import { render } from '../../testUtils/renderWithRedux';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'test/test/test',
  }),
}));

jest.mock('axios');

describe('Setting Panel Behaviour', () => {
  it('The setting panel should be open if `isTranerValid` is false.', () => {
    const { getByText } = render(<MainLayout />, {
      initialState: { setting: { ...initialSetting, isTrainerValid: false } },
    });

    expect(getByText(/Settings/)).not.toBeNull();
  });

  it("The project dropdown shouldn't be shown when `isTrainerValid` is false", () => {
    const { queryByText } = render(<MainLayout />, {
      initialState: { setting: { ...initialSetting, isTrainerValid: false } },
    });
    expect(queryByText(/Project/)).toBeNull();
  });

  it('The data policy dialog should be shown when the app is initialized', () => {
    const { getByText } = render(<MainLayout />, {
      initialState: { setting: { ...initialSetting, isTrainerValid: false, appInsightHasInit: false } },
    });
    expect(getByText(/Data Collection Policy/)).not.toBeNull();
  });
});
