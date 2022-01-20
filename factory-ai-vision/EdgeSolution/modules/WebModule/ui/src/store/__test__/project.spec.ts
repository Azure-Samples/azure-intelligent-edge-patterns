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
    expect((mockAxios as any).mock.calls[0][1].data.needRetraining).toBe(false);
  });
});
