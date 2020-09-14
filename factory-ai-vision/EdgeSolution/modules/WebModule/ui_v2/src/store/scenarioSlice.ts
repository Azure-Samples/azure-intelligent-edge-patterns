import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';
import { InferenceMode } from './project/projectTypes';

type Scenario = {
  id: number;
  name: string;
  inferenceMode: InferenceMode;
  trainingProject: number;
  cameras: number[];
  parts: number[];
};

export const getScenario = createAsyncThunk('scenario/get', async () => {
  const res = await Axios.get('/api/part_detection_scenarios');
  return res.data.map((e) => ({
    id: e.id,
    name: e.name,
    inferenceMode: e.inference_mode,
    trainingProject: e.project,
    cameras: e.cameras,
    parts: e.parts,
  }));
});

const slice = createSlice<Scenario[], any, string>({
  name: 'scenario',
  initialState: [],
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(getScenario.fulfilled, (_, action) => {
      return action.payload;
    }),
});

const { reducer } = slice;

export default reducer;
