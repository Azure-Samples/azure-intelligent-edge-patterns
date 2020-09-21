import { AsyncThunkPayloadCreator, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

export const getErrorLog = (e: AxiosError): string => e?.response?.data?.error?.message || e.message;

export function createWrappedAsync<Returned, ThunkArg = void, ThunkApiConfig = {}>(
  prefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
  options?: any,
) {
  const wrappedPayloadCreator = async (arg, thunkAPI) => {
    try {
      return await payloadCreator(arg, thunkAPI);
    } catch (e) {
      return thunkAPI.rejectWithValue(getErrorLog(e));
    }
  };
  return createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(prefix, wrappedPayloadCreator, options);
}
