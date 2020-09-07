import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';

type TrainingProject = {
  id: number;
  name: string;
  customVisionId: string;
};

export const getTrainingProject = createAsyncThunk<any, { isDemo?: boolean }, { state: State }>(
  'trainingSlice/get',
  async ({ isDemo }) => {
    const url = isDemo === undefined ? `/api/projects/` : `/api/projects?is_demo=${Number(isDemo)}`;
    const response = await Axios.get(url);
    return response.data.map((e) => ({
      id: e.id,
      name: e.name,
      customVisionId: e.customvision_id,
    }));
  },
  {
    condition: (_, { getState }) => getState().trainingProject.ids.length === 0,
  },
);

const entityAdapter = createEntityAdapter<TrainingProject>();

const slice = createSlice({
  name: 'trainingSlice',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTrainingProject.fulfilled, entityAdapter.setAll);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllTrainingProjects,
  selectById: selectTrainingProjectById,
} = entityAdapter.getSelectors((state: State) => state.trainingProject);
export const trainingProjectOptionsSelector = createSelector(selectAllTrainingProjects, (trainingProjects) =>
  trainingProjects.map((e) => ({
    key: e.id,
    text: e.name,
  })),
);
