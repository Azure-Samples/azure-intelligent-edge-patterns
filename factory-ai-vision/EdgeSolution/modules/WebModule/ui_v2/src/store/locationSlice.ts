import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

export type Location = {
  id: number;
  name: string;
};

const locationsAdapter = createEntityAdapter<Location>();

export const getLocations = createWrappedAsync<any, boolean, { state: State }>(
  'locations/get',
  async (isDemo) => {
    const response = await Axios.get(`/api/locations?is_demo=${Number(isDemo)}`);
    return response.data;
  },
  {
    condition: (_, { getState }) => getState().locations.ids.length === 0,
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

const locationSlice = createSlice({
  name: 'locations',
  initialState: locationsAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLocations.fulfilled, locationsAdapter.setAll)
      .addCase(postLocation.fulfilled, locationsAdapter.addOne)
      .addCase(deleteLocation.fulfilled, locationsAdapter.removeOne);
  },
});

const { reducer } = locationSlice;

export default reducer;

export const {
  selectAll: selectAllLocations,
  selectById: selectLocationById,
  selectEntities: selectLocationEntities,
} = locationsAdapter.getSelectors<State>((state) => state.locations);
