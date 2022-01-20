import { AxiosError } from 'axios';

export const handleAxiosError = (e: AxiosError): Error => {
  if (e.response) return new Error(JSON.stringify(e.response.data));
  if (e.request) return new Error(JSON.stringify(e.request));
  return e;
};
