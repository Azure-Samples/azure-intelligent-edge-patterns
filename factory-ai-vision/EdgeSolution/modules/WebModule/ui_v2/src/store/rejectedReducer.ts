import { AnyAction, createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'rejectMsg',
  initialState: '',
  reducers: {
    clearRejectMsg: () => '',
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is AnyAction => action.type.endsWith('/rejected'),
      (_, action) => {
        return action.error.message;
      },
    );
  },
});

const { reducer: rejectReducer } = slice;
export default rejectReducer;

export const { clearRejectMsg } = slice.actions;
