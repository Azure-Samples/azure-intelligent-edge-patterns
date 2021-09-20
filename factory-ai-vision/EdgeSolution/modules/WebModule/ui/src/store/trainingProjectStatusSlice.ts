import Axios from 'axios';
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type TrainingStatus = 'ok' | 'training' | 'failed' | 'success' | 'No change';

export interface Status {
  id: number;
  log: string;
  need_to_send_notification: boolean;
  performance: string;
  project: number;
  status: TrainingStatus;
}

export const getTrainingProjectStatusList = createWrappedAsync('trainingProjectStatusSlice/get', async () => {
  const response = await Axios('/api/training_status');

  return response.data;
});

export const getOneTrainingProjectStatus = createWrappedAsync<any, number>(
  'trainingProjectStatusSlice/getOne',
  async (projectId) => {
    const response = await Axios(`/api/training_status/${projectId}`);

    return response.data;
  },
);

const entityAdapter = createEntityAdapter<Status>();

const slice = createSlice({
  name: 'trainingProjectStatusSlice',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTrainingProjectStatusList.fulfilled, entityAdapter.setAll);
    builder.addCase(getOneTrainingProjectStatus.fulfilled, entityAdapter.upsertOne);
  },
});

const { reducer } = slice;

export const {
  selectAll: selectAllTrainingProjectsStatus,
  selectById: selectTrainingProjectStatusById,
} = entityAdapter.getSelectors((state: State) => state.trainingProjectStatus);

export default reducer;
