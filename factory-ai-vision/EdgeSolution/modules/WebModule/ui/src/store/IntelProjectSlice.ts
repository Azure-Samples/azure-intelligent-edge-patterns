import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';
import { refreshTrainingProject } from './trainingProjectSlice';
import { getTrainingProjectStatusList } from './trainingProjectStatusSlice';
import { INTEL_CARD_DATA } from './TEMP_DATA';

export type OpenVinoType = 'ObjectDetection' | 'Classification';

export type IntelProject = {
  id: number;
  name: string;
  describe: string;
  imageUrl: string;
  inputDescribe: string;
  metrics: any;
  inputs: any;
  model_name: string;
  createdAt: string;
  tags: string[];
  type: string;
  create_name: string;
  model_type: OpenVinoType;
};

const intelProjectAdapter = createEntityAdapter<IntelProject>();

const normalize = (e) => {
  const matchData = INTEL_CARD_DATA.find((data) => data.model_id.toString() === e.model_id);

  return {
    ...matchData,
    ...e,
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
  { create_name: string; project_type: string },
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
