import React from 'react';
import MockAxios from 'axios';
import { waitFor } from '@testing-library/react';
import { render } from '../../testUtils/renderWithRedux';
import { RTSPVideo } from '../RTSPVideo';

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  get: jest.fn(),
}));

test('should create the stream with right query parameter', async () => {
  const fakeCameraId = 0;
  const fakePartId = 10;
  const mockOnStreamCreated = jest.fn();
  (MockAxios.get as any).mockResolvedValue({ data: { stream_id: '' } });
  render(<RTSPVideo cameraId={fakeCameraId} onStreamCreated={mockOnStreamCreated} />);

  await waitFor(() => {
    expect(MockAxios.get).toBeCalledWith(`/api/streams/connect/?camera_id=${fakeCameraId}`);
  });

  render(<RTSPVideo cameraId={fakeCameraId} onStreamCreated={mockOnStreamCreated} partId={fakePartId} />);
  await waitFor(() => {
    expect(MockAxios.get).toBeCalledWith(
      `/api/streams/connect/?part_id=${fakePartId}&camera_id=${fakeCameraId}`,
    );
  });
});

test('should called the callback `onStreamCreated` with stream ID when stream created', async () => {
  const fakeCameraId = 0;
  const mockOnStreamCreated = jest.fn();
  const mockStreamId = 'streamId';
  (MockAxios.get as any).mockResolvedValue({ data: { stream_id: mockStreamId } });
  render(<RTSPVideo cameraId={fakeCameraId} onStreamCreated={mockOnStreamCreated} />);

  await waitFor(() => {
    expect(mockOnStreamCreated).toBeCalledWith(mockStreamId);
  });
});

jest.useFakeTimers();

test('should polling keep alive if the stream exist', async () => {
  const fakeCameraId = 0;
  const mockOnStreamCreated = jest.fn();
  const mockStreamId = 'streamId';
  (MockAxios.get as any).mockResolvedValue({ data: { stream_id: mockStreamId } });
  render(<RTSPVideo cameraId={fakeCameraId} onStreamCreated={mockOnStreamCreated} />);

  await waitFor(() => {
    expect(MockAxios.get).toHaveBeenLastCalledWith(`/api/streams/${mockStreamId}/keep_alive`);
  });
});
