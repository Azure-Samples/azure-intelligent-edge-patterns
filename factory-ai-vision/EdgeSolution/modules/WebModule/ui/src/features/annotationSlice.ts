import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { getImages } from './imageSlice';
import { Annotation } from './type';

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
