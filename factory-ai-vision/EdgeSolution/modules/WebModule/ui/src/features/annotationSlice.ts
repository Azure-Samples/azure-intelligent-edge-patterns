import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getImages } from './imageSlice';
import { Annotation } from './type';
import { State } from '../store/State';

const entityAdapter = createEntityAdapter<Annotation>();

const slice = createSlice({
  name: 'label',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(getImages.fulfilled, (state, action) => {
      entityAdapter.setAll(state, action.payload.labels || {});
    }),
});

const { reducer } = slice;
export default reducer;

export const { selectById: selectAnnoById, selectEntities: selectAnnoEntities } = entityAdapter.getSelectors(
  (state: State) => state.annotations,
);
