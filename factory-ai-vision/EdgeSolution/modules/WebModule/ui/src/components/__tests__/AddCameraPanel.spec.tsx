import userEvent from '@testing-library/user-event';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { IDropdownOption } from '@fluentui/react';
import { render } from '../../testUtils/renderWithRedux';
import { dummyFunction } from '../../utils/dummyFunction';
import { PanelMode } from '../AddPartPanel';
import { postCamera as mockPostCamera } from '../../store/cameraSlice';
import { Component as AddCameraPanel } from '../AddCameraPanel';
import { postLocation as mockPostLocation } from '../../store/locationSlice';

jest.mock('../../store/cameraSlice', () => ({
  ...jest.requireActual('../../store/cameraSlice'),
  postCamera: jest.fn(),
}));

jest.mock('../../store/locationSlice', () => ({
  ...jest.requireActual('../../store/locationSlice'),
  getLocations: jest.fn().mockReturnValue({ type: 'test' }),
  postLocation: jest.fn(),
}));

test('should able to enter camera name, RTSP Url', () => {
  const { getByRole } = render(
    <AddCameraPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} locationOptions={[]} />,
  );

  const testCamera = 'test camera';
  const testRtspUrl = 'rtsp://';

  userEvent.type(getByRole('textbox', { name: /camera name/i }), testCamera);
  userEvent.type(getByRole('textbox', { name: /rtsp url/i }), testRtspUrl);

  expect(getByRole('textbox', { name: /camera name/i })).toHaveValue(testCamera);
  expect(getByRole('textbox', { name: /rtsp url/i })).toHaveValue(testRtspUrl);
});

test('should dispatch the right API in different mode', async () => {
  (mockPostCamera as any).mockReturnValueOnce(dummyFunction);
  const mockLocationOption: IDropdownOption = {
    key: 0,
    text: 'location1',
  };
  const { getByRole, getByLabelText } = render(
    <AddCameraPanel
      isOpen={true}
      onDissmiss={dummyFunction}
      mode={PanelMode.Create}
      locationOptions={[mockLocationOption]}
    />,
  );

  const testCamera = 'test camera';
  const testRtspUrl = 'rtsp://';

  userEvent.type(getByRole('textbox', { name: /camera name/i }), testCamera);
  userEvent.type(getByRole('textbox', { name: /rtsp url/i }), testRtspUrl);

  // Pick a location
  userEvent.click(getByLabelText('Location'));
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

test('able to create a new location with the dialog', async () => {
  const { getByTestId, getByRole, getByDisplayValue } = render(
    <AddCameraPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} locationOptions={[]} />,
  );

  userEvent.click(getByRole('button', { name: /create location/i }));
  userEvent.type(getByTestId(/location-input/i), 'new location');

  expect(getByDisplayValue('new location')).not.toBeNull();
});

test('should dispatch right action when pressing create button', async () => {
  const { getByRole, getByTestId } = render(
    <AddCameraPanel isOpen={true} onDissmiss={dummyFunction} mode={PanelMode.Create} locationOptions={[]} />,
  );
  (mockPostLocation as any).mockReturnValueOnce(() => Promise.resolve({ payload: { id: 0 } }));

  userEvent.click(getByRole('button', { name: /create location/i }));

  const mockLocationName = 'new location';
  userEvent.type(getByTestId(/location-input/i), mockLocationName);
  userEvent.click(getByRole('button', { name: 'Create' }));

  await waitFor(() => {
    expect(mockPostLocation).toHaveBeenCalledTimes(1);
    expect(mockPostLocation).toHaveBeenCalledWith({ name: mockLocationName });
  });
});
