import { createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

import { State } from '../store/State';
import { Image } from './imageSlice';

export const updateRelabelImages = createAsyncThunk<any, undefined, { state: State }>(
  'updateRelabel',
  async (_, { getState }) => {
    const data: { partId: number; imageId: number }[] = Object.values(
      getState().labelImages.entities as Image[],
    )
      .filter((e) => e.isRelabel)
      .map((e) => ({ partId: e.part, imageId: e.id }));

    await Axios.post('/api/relabel/update', data);
  },
);
