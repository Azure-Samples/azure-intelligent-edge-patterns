import userEvent from '@testing-library/user-event';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { IDropdownOption } from '@fluentui/react';
import { render } from '../../testUtils/renderWithRedux';
import { dummyFunction } from '../../utils/dummyFunction';
import { PanelMode } from '../AddPartPanel';
import { postCamera as mockPostCamera } from '../../store/cameraSlice';
import { Component as AddCameraPanel } from '../AddCameraPanel';

jest.mock('../../store/cameraSlice', () => ({
  ...jest.requireActual('../../store/cameraSlice'),
  postCamera: jest.fn(),
}));

test('should able to enter camera name, RTSP Url', () => {
  const { getByLabelText } = render(
    <AddCameraPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} locationOptions={[]} />,
  );

  const testCamera = 'test camera';
  const testRtspUrl = 'rtsp://';

  userEvent.type(getByLabelText(/camera name/i), testCamera);
  userEvent.type(getByLabelText(/rtsp url/i), testRtspUrl);

  expect(getByLabelText(/camera name/i)).toHaveValue(testCamera);
  expect(getByLabelText(/rtsp url/i)).toHaveValue(testRtspUrl);
});

test('should dispatch the right API in different mode', async () => {
  (mockPostCamera as any).mockReturnValueOnce(dummyFunction);
  const mockLocationOption: IDropdownOption = {
    key: 0,
    text: 'location1',
  };
  const { getByLabelText, getByRole } = render(
    <AddCameraPanel
      isOpen={true}
      onDissmiss={dummyFunction}
      mode={PanelMode.Create}
      locationOptions={[mockLocationOption]}
    />,
  );

  const testCamera = 'test camera';
  const testRtspUrl = 'rtsp://';

  userEvent.type(getByLabelText(/camera name/i), testCamera);
  userEvent.type(getByLabelText(/rtsp url/i), testRtspUrl);

  // Pick a location
  userEvent.click(getByRole('option'));
  userEvent.click(getByRole('option', { name: mockLocationOption.text }));

  userEvent.click(getByRole('button', { name: /add/i }));

  await waitFor(() => {
    expect(mockPostCamera).toHaveBeenCalledTimes(1);
    expect(mockPostCamera).toHaveBeenCalledWith({
      name: testCamera,
      rtsp: testRtspUrl,
      location: mockLocationOption.key,
    });
  });
});
