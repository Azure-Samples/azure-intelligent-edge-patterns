import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

import { refreshTrainingProject } from './trainingProjectSlice';
import { getTrainingProjectStatusList } from './trainingProjectStatusSlice';

export type IntelProject = {
  id: number;
  name: string;
  describe: string;
  imageUrl: string;
  inputDescribe: string;
  metric: {
    ap?: string;
    GFlops: string;
    MParams: string;
    sf: string;
    ifo?: string;
    rip?: string;
    roop?: string;
    mow?: string;
  };
  model_name: string;
  createdAt: string;
  tags: string[];
  type: string;
  create_name: string;
};

const INTEL_OVMS_CARD_DATA = [
  {
    id: 1,
    name: 'Face Detection',
    describe:
      'Face detector based on MobileNetV2 as a backbone with a single SSD head for indoor/outdoor scenes shot by a front-facing camera. The single SSD head from 1/16 scale feature map has nine clustered prior boxes.',
    type: 'Object Detector',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/face-detection-retail-0005/assets/face-detection-retail-0001.png',
    inputDescribe: 'Image, name: input, shape: 1, 3, 300, 300 in the format B, C, H, W, where:',
    createdAt: '7/3/2021',
    tags: ['person'],
    metric: {
      ap: '84.52%',
      GFlops: '0.982',
      MParams: '1.021',
      sf: 'PyTorch',
    },
    model_id: 1,
    create_name: 'face_detection',
  },
  {
    id: 2,
    name: 'Emotion Recognition',
    describe: `Fully convolutional network for recognition of five emotions ('neutral', 'happy', 'sad', 'surprise', 'anger').`,
    type: 'Classifier',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/emotions-recognition-retail-0003/assets/emotions-recognition-retail-0003.jpg',
    inputDescribe: 'Image, name: data, shape: 1, 3, 64, 64 in 1, C, H, W format, where:',
    createdAt: '7/3/2021',
    tags: ['neutral', 'happy', 'sad', 'surprise', 'anger'],
    metric: {
      ifo: 'Frontal',
      rip: '±15˚',
      roop: 'Yaw: ±15˚ / Pitch: ±15˚',
      mow: '64 pixels',
      GFlops: '0.126',
      MParams: '2.483',
      sf: 'Caffe',
    },
    model_id: 3,
    create_name: 'emotion_recognition',
  },
  {
    id: 3,
    name: 'Age / Gender Recognition',
    describe:
      'Fully convolutional network for simultaneous Age/Gender recognition. The network is able to recognize age of people in [18, 75] years old range, it is not applicable for children since their faces were not in the training set.',
    type: 'Object Detector',
    imageUrl:
      'https://raw.githubusercontent.com/openvinotoolkit/open_model_zoo/master/models/intel/age-gender-recognition-retail-0013/assets/age-gender-recognition-retail-0001.jpg',
    inputDescribe: 'Image, name: input, shape: 1, 3, 62, 62 in 1, C, H, W format, where:',
    createdAt: '7/3/2021',
    tags: ['female', 'male'],
    metric: {
      // ifo: 'Frontal',
      rip: '±45˚',
      roop: 'Yaw: ±45˚ / Pitch: ±45˚',
      mow: '62 pixels',
      GFlops: '0.094',
      MParams: '2.138',
      sf: 'Caffe',
    },
    model_id: 2,
    create_name: 'age_gender_recognition',
  },
];

const intelProjectAdapter = createEntityAdapter<IntelProject>();

const normalize = (e) => {
  const matchData = INTEL_OVMS_CARD_DATA.find((data) => data.model_id.toString() === e.model_id);

  return {
    ...matchData,
    model_name: e.model_name,
  };
};
export const getIntelProjectList = createWrappedAsync<any, undefined, { state: State }>(
  'intel/getIntelProjectList',
  async (_, { getState }) => {
    const [nonDemoProject] = getState().trainingProject.nonDemo;

    const response = await Axios.get(`/api/projects/${nonDemoProject}/get_default_ovms_model`);

    return response.data.model_infos.map((info) => normalize(info));
  },
);

export const createIntelProject = createWrappedAsync<
  any,
  { model_name: string; project_type: string },
  { state: State }
>('intel/createIntelProject', async (payload, { getState, dispatch }) => {
  const [nonDemoProject] = getState().trainingProject.nonDemo;

  await Axios.post(`/api/projects/${nonDemoProject}/add_ovms_model`, payload);

  dispatch(refreshTrainingProject());
  dispatch(getTrainingProjectStatusList());
});

const intelSlice = createSlice({
  name: 'intelProject',
  initialState: intelProjectAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getIntelProjectList.fulfilled, intelProjectAdapter.setAll);
  },
});

const { reducer } = intelSlice;

export default reducer;

export const {
  selectAll: selectAllIntelProject,
  selectById: selectIntelProjectById,
  selectEntities: selectIntelProjectEntities,
} = intelProjectAdapter.getSelectors<State>((state) => state.intelProject);
