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
  PatchCameraAreaSuccess,
  PATCH_CAMERA_AREA_SUCCESS,
  PatchCameraAreaRequest,
  PATCH_CAMERA_AREA_REQUEST,
  PatchCameraAreaFailed,
  PATCH_CAMERA_AREA_FAILED,
} from './cameraTypes';
import { AOIData } from '../../type';

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

const patchCameraAreaRequest = (): PatchCameraAreaRequest => ({
  type: PATCH_CAMERA_AREA_REQUEST,
});

const patchCameraAreaSuccess = (id: number, data: Camera): PatchCameraAreaSuccess => ({
  type: PATCH_CAMERA_AREA_SUCCESS,
  payload: {
    id,
    data,
  },
});

const patchCameraAreaFailed = (error): PatchCameraAreaFailed => ({
  type: PATCH_CAMERA_AREA_FAILED,
  error,
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

export const patchCameraArea = (aoi: AOIData, cameraId: number) => (dispatch): Promise<void> => {
  dispatch(patchCameraAreaRequest());

  return axios
    .patch(`/api/cameras/${cameraId}/`, {
      area: JSON.stringify(aoi),
    })
    .then(({ data }) => {
      dispatch(patchCameraAreaSuccess(data.id, data));
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
    });
  // FIXME Currently handle the error outside, but should add a error property in camera
  // .catch((err) => {
  //   dispatch(patchCameraAreaFailed(err));
  // });
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
