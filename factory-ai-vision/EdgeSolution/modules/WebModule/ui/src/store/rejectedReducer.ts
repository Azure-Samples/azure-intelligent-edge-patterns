import { createReducer, AnyAction } from '@reduxjs/toolkit';

const rejectReducer = createReducer('', (builder) => {
  builder.addMatcher(
    (action): action is AnyAction => action.type.endsWith('/rejected'),
    (_, action) => {
      return action.error.message;
    },
  );
});

export default rejectReducer;
