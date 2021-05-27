import { createSlice } from '@reduxjs/toolkit';
import Axios from 'axios';
import { InferenceMode } from './project/projectTypes';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Scenario = {
  id: number;
  name: string;
  inferenceMode: InferenceMode;
  trainingProject: number;
  cameras: number[];
  parts: number[];
  fps: string;
};

export const getScenario = createWrappedAsync('scenario/get', async () => {
  const res = await Axios.get('/api/part_detection_scenarios');
  return res.data.map((e) => ({
    id: e.id,
    name: e.name,
    inferenceMode: e.inference_mode,
    trainingProject: e.project,
    cameras: e.cameras,
    parts: e.parts,
    fps: e.fps.toString(),
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
