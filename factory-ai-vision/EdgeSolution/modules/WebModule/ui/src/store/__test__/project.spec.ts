import mockAxios from 'axios';
import { thunkPostProject } from '../project/projectActions';
import { initialProjectData } from '../project/projectReducer';

jest.mock('axios', () => {
  return jest.fn().mockResolvedValue({});
});

const mockDispatch = jest.fn();
const mockState = {
  project: {
    data: initialProjectData,
  },
  trainingProject: {
    isDemo: [1],
  },
};
const mockGetState = () => mockState;
const mockProjectData = { ...initialProjectData, trainingProject: 1 };

describe('Post project', () => {
  it('needRetraining should be false when the trainingProject is demo', () => {
    thunkPostProject(mockProjectData)(mockDispatch, mockGetState as any, undefined);
    expect((mockAxios as any).mock.calls[0][1]).toStrictEqual({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        parts: initialProjectData.parts,
        cameras: initialProjectData.cameras,
        project: 1,
        needRetraining: false,
        accuracyRangeMin: initialProjectData.accuracyRangeMin,
        accuracyRangeMax: initialProjectData.accuracyRangeMax,
        maxImages: initialProjectData.maxImages,
        metrics_is_send_iothub: initialProjectData.sendMessageToCloud,
        metrics_frame_per_minutes: initialProjectData.framesPerMin,
        name: initialProjectData.name,
        send_video_to_cloud: [],
        inference_mode: initialProjectData.inferenceMode,
        fps: 10,
        inference_protocol: 'grpc',
        send_video_to_cloud: [],
        disable_video_feed: false,
        prob_threshold: 10,
      },
    });
  });
});
