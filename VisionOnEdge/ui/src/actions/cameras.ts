import { Camera } from '../State';

export const GET_CAMERA_SUCCESS = 'GET_CAMERA_SUCCESS';
type getCamerasSuccess = { type: typeof GET_CAMERA_SUCCESS; payload: Camera[] };
export const POST_CAMERA_SUCCESS = 'POST_CAMERA_SUCCESS';
type postCamerasSuccess = { type: typeof POST_CAMERA_SUCCESS; payload: Camera };
export const REQUEST_CAMERA_FAILURE = 'REQUEST_CAMERA_FAILURE';
type requestCamerasFailure = { type: typeof REQUEST_CAMERA_FAILURE };

const getCamerasSuccess = (data: Camera[]): getCamerasSuccess => ({
  type: GET_CAMERA_SUCCESS,
  payload: data,
});

const requestCamerasFailure = (error: any): requestCamerasFailure => {
  console.error(error);
  return { type: REQUEST_CAMERA_FAILURE };
};

const postCamerasSuccess = (data: Camera): postCamerasSuccess => ({
  type: POST_CAMERA_SUCCESS,
  payload: data,
});

export const getCameras = () => (dispatch): Promise<void> => {
  return fetch('/api/cameras/')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      dispatch(getCamerasSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestCamerasFailure(err));
    });
};

export const postCameras = (newCamera: Camera) => (dispatch): Promise<void> => {
  return fetch('/api/cameras/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCamera),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      dispatch(postCamerasSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestCamerasFailure(err));
    });
};

export type CameraAction = getCamerasSuccess | postCamerasSuccess | requestCamerasFailure;
