import React from 'react';
import { waitFor } from '@testing-library/react';
import moxios from 'moxios';
import userEvent from '@testing-library/user-event';
import { render } from '../../testUtils/renderWithRedux';
import { dummyFunction } from '../../utils/dummyFunction';
import { Component as CaptureDialog } from '../CaptureDialog';
import { OpenFrom } from '../../store/labelingPageSlice';

beforeEach(function () {
  // import and pass your custom axios instance to this method
  moxios.install();
});

afterEach(function () {
  // import and pass your custom axios instance to this method
  moxios.uninstall();
});

it('if there is only one camera, selected it as default', () => {
  const { getByRole } = render(
    <CaptureDialog
      isOpen={true}
      onDismiss={dummyFunction}
      openLabelingPage={dummyFunction}
      captureImage={dummyFunction}
      getCameras={dummyFunction}
    />,
    {
      initialState: {
        camera: {
          ids: [5],
          entities: {
            '5': {
              id: 5,
              name: 'test',
            },
          },
        },
      },
    },
  );

  expect(getByRole('option', { name: /test/i })).not.toBeNull();
});

it('should show the banner when the capture is success', async () => {
  const { getByText, getByRole } = render(
    <CaptureDialog
      isOpen={true}
      onDismiss={dummyFunction}
      openLabelingPage={dummyFunction}
      captureImage={jest.fn().mockResolvedValue({})}
      getCameras={jest.fn().mockResolvedValue({ payload: null })}
    />,
  );

  userEvent.click(getByRole('button', { name: /capture image/i }));

  await waitFor(() => {
    expect(getByText(/image saved/i)).not.toBeNull();
  });
});

it('should show the go label button after capturing first image', async () => {
  const { getByRole } = render(
    <CaptureDialog
      isOpen={true}
      onDismiss={dummyFunction}
      openLabelingPage={dummyFunction}
      captureImage={jest.fn().mockResolvedValue({ payload: { images: { 1: {} } } })}
      getCameras={jest.fn().mockResolvedValue({ payload: null })}
    />,
  );

  userEvent.click(getByRole('button', { name: /capture image/i }));

  await waitFor(() => {
    expect(getByRole('button', { name: /go to tagging/i })).not.toBeNull();
  });
});

it('should dispatch right action when pressing go tagging button', async () => {
  const mockOpenLabelingPage = jest.fn();
  const { getByRole } = render(
    <CaptureDialog
      isOpen={true}
      onDismiss={dummyFunction}
      openLabelingPage={mockOpenLabelingPage}
      captureImage={jest
        .fn()
        .mockResolvedValueOnce({ payload: { images: { 1: {} } } })
        .mockResolvedValueOnce({ payload: { images: { 2: {} } } })
        .mockResolvedValueOnce({ payload: { images: { 3: {} } } })}
      getCameras={jest.fn().mockResolvedValue({ payload: null })}
    />,
  );

  for (let i = 0; i < 3; i++) {
    userEvent.click(getByRole('button', { name: /capture image/i }));
  }

  await waitFor(() => {
    userEvent.click(getByRole('button', { name: /go to tagging/i }));
    expect(mockOpenLabelingPage).toBeCalledWith({
      imageIds: [1, 2, 3],
      selectedImageId: 1,
      openFrom: OpenFrom.CaptureDialog,
    });
  });
});
