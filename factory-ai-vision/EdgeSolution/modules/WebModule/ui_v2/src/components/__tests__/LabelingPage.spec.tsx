import React from 'react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import moxios from 'moxios';

import { State } from 'RootStateType';
import LabelingPage from '../LabelingPage/LabelingPage';
import { render } from '../../testUtils/renderWithRedux';
import { OpenFrom } from '../../store/labelingPageSlice';

beforeEach(function () {
  // import and pass your custom axios instance to this method
  moxios.install();
});

afterEach(function () {
  // import and pass your custom axios instance to this method
  moxios.uninstall();
});

test('able to go back to capture when opened from go tagging', async () => {
  const mockOpenCaptureDialog = jest.fn();
  const initialState: Partial<State> = {
    labelingPage: {
      imageIds: [0],
      selectedImageId: 0,
      openFrom: OpenFrom.CaptureDialog,
    },
  };
  const { getByRole } = render(<LabelingPage onSaveAndGoCaptured={mockOpenCaptureDialog} />, {
    initialState,
  });

  userEvent.click(getByRole('button', { name: /Save and capture another image/i }));
  await waitFor(() => {
    expect(mockOpenCaptureDialog).toBeCalledTimes(1);
  });
});
