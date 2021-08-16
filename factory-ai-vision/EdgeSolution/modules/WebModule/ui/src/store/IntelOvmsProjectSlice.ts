import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Location = {
  id: number;
  name: string;
};

const locationsAdapter = createEntityAdapter<Location>();

export const getIntelOvmsProjectList = createWrappedAsync<any, undefined, { state: State }>(
  'Intel/getIntelProjectList',
  async (_, { getState }) => {
    const [nonDemoProject] = getState().trainingProject.nonDemo;

    const response = await Axios.get(`/api/projects/${nonDemoProject}/get_default_ovms_model`);
    console.log('response', response);

    return response.data;
  },
);

export const postLocation = createWrappedAsync(
  'locations/post',
  async (newLocation: Omit<Location, 'id'>) => {
    const response = await Axios.post(`/api/locations/`, newLocation);
    return response.data;
  },
);

export const deleteLocation = createWrappedAsync('locations/delete', async (id: number) => {
  await Axios.delete(`/api/locations/${id}/`);
  return id;
});

const intelSlice = createSlice({
  name: 'intelOvms',
  initialState: locationsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getIntelOvmsProjectList.fulfilled, locationsAdapter.setAll)
      .addCase(postLocation.fulfilled, locationsAdapter.addOne)
      .addCase(deleteLocation.fulfilled, locationsAdapter.removeOne);
  },
});

const { reducer } = intelSlice;

export default reducer;

export const {
  selectAll: selectAllLocations,
  selectById: selectLocationById,
  selectEntities: selectLocationEntities,
} = locationsAdapter.getSelectors<State>((state) => state.locations);
