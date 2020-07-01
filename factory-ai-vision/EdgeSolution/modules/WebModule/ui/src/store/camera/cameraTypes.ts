// Describing the shape of the camera's slice of state
export type Camera = {
  id?: number;
  name: string;
  rtsp: string;
  area?: string;
  is_demo: boolean;
};

// Describing the different ACTION NAMES available
export const GET_CAMERA_SUCCESS = 'GET_CAMERA_SUCCESS';
export const POST_CAMERA_SUCCESS = 'POST_CAMERA_SUCCESS';
export const DELETE_CAMERA_SUCCESS = 'DELETE_CAMERA_SUCCESS';
export const REQUEST_CAMERA_FAILURE = 'REQUEST_CAMERA_FAILURE';

export type GetCamerasSuccess = { type: typeof GET_CAMERA_SUCCESS; payload: Camera[] };
export type PostCameraSuccess = { type: typeof POST_CAMERA_SUCCESS; payload: Camera };
export type DeleteCameraSuccess = { type: typeof DELETE_CAMERA_SUCCESS; payload: { id: number } };
export type RequestCamerasFailure = { type: typeof REQUEST_CAMERA_FAILURE };

export type CameraAction =
  | GetCamerasSuccess
  | PostCameraSuccess
  | DeleteCameraSuccess
  | RequestCamerasFailure;
