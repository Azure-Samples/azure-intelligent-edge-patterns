import { createSlice, createEntityAdapter, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';

export type Camera = {
  id: number;
  name: string;
  rtsp: string;
  area: string;
};

const entityAdapter = createEntityAdapter<Camera>();

export const getCameras = createAsyncThunk('cameras/get', async (isDemo: boolean) => {
  const response = await Axios(`/api/cameras?is_demo=${Number(isDemo)}`);
  return response.data;
});

const slice = createSlice({
  name: 'cameras',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCameras.fulfilled, entityAdapter.setAll);
  },
});

const { reducer } = slice;
export default reducer;

export const { selectAll: selectAllCameras, selectById: selectCameraById } = entityAdapter.getSelectors(
  (state: State) => state.camera,
);
