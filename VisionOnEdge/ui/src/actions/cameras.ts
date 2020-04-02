import { Camera } from '../State';

export const GET_CAMERA_SUCCESS = 'GET_CAMERA_SUCCESS';
export const GET_CAMERA_FAILURE = 'GET_CAMERA_FAILURE';
export const POST_CAMERA_SUCCESS = 'POST_CAMERA_SUCCESS';

const getCamerasSuccess = (data: Camera[]): any => ({ type: GET_CAMERA_SUCCESS, payload: data });

const requestCamerasFailure = (error: any): any => {
  console.error(error);
  return { type: GET_CAMERA_FAILURE };
};

const postCamerasSuccess = (data: Camera[]): any => ({ type: POST_CAMERA_SUCCESS, payload: data });

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
