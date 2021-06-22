import axios from 'axios';
import {
  GET_CAMERA_SUCCESS,
  POST_CAMERA_SUCCESS,
  REQUEST_CAMERA_FAILURE,
  GetCamerasSuccess,
  RequestCamerasFailure,
  PostCameraSuccess,
  Camera,
  DELETE_CAMERA_SUCCESS,
  DeleteCameraSuccess,
} from './cameraTypes';

const getCamerasSuccess = (data: Camera[]): GetCamerasSuccess => ({
  type: GET_CAMERA_SUCCESS,
  payload: data,
});

const deleteCameraSuccess = (id: number): DeleteCameraSuccess => ({
  type: DELETE_CAMERA_SUCCESS,
  payload: { id },
});

const requestCamerasFailure = (error: any): RequestCamerasFailure => {
  alert(error);
  return { type: REQUEST_CAMERA_FAILURE };
};

const postCameraSuccess = (data: Camera): PostCameraSuccess => ({
  type: POST_CAMERA_SUCCESS,
  payload: data,
});

export const getCameras = () => (dispatch): Promise<void> => {
  return axios('/api/cameras/')
    .then(({ data }) => {
      dispatch(getCamerasSuccess(data));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestCamerasFailure(err));
    });
};

export const postCamera = (newCamera: Camera) => (dispatch): Promise<void> => {
  return axios('/api/cameras/', {
    method: 'POST',
    data: newCamera,
  })
    .then(({ data }) => {
      dispatch(postCameraSuccess(data));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.log);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((err) => {
      dispatch(requestCamerasFailure(err));
    });
};

export const deleteCamera = (id: number) => (dispatch): Promise<void> => {
  return axios(`/api/cameras/${id}/`, {
    method: 'DELETE',
  })
    .then(() => {
      dispatch(deleteCameraSuccess(id));
      return void 0;
    })
    .catch((err) => {
      dispatch(requestCamerasFailure(err));
    });
};
