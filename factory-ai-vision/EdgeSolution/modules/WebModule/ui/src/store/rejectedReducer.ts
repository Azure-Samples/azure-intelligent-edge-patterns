import { AnyAction, createSlice } from '@reduxjs/toolkit';

const rejectedActionTypesWhichHasBeenHandled: string[] = ['settings/listAllProjects/rejected'];

const actionNotHandled = (actionType: string) => !rejectedActionTypesWhichHasBeenHandled.includes(actionType);

const isRejectedAction = (action): action is AnyAction =>
  action.type.endsWith('/rejected') && actionNotHandled(action.type);

const slice = createSlice({
  name: 'rejectMsg',
  initialState: '',
  reducers: {
    clearRejectMsg: () => '',
  },
  extraReducers: (builder) => {
    builder.addMatcher(isRejectedAction, (_, action) => {
      return action.payload;
    });
  },
});

const { reducer: rejectReducer } = slice;
export default rejectReducer;

export const { clearRejectMsg } = slice.actions;
