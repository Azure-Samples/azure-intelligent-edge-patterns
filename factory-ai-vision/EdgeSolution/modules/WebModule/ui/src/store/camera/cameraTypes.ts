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
export const PATCH_CAMERA_AREA_REQUEST = 'PATCH_CAMERA_AREA_REQUEST';
export const PATCH_CAMERA_AREA_SUCCESS = 'PATCH_CAMERA_AREA_SUCCESS';
export const PATCH_CAMERA_AREA_FAILED = 'PATCH_CAMERA_AREA_FAILED';

export type GetCamerasSuccess = { type: typeof GET_CAMERA_SUCCESS; payload: Camera[] };
export type PostCameraSuccess = { type: typeof POST_CAMERA_SUCCESS; payload: Camera };
export type DeleteCameraSuccess = { type: typeof DELETE_CAMERA_SUCCESS; payload: { id: number } };
export type RequestCamerasFailure = { type: typeof REQUEST_CAMERA_FAILURE };
export type PatchCameraAreaRequest = { type: typeof PATCH_CAMERA_AREA_REQUEST };
export type PatchCameraAreaSuccess = {
  type: typeof PATCH_CAMERA_AREA_SUCCESS;
  payload: { id: number; data: Camera };
};
export type PatchCameraAreaFailed = { type: typeof PATCH_CAMERA_AREA_FAILED; error };

export type CameraAction =
  | GetCamerasSuccess
  | PostCameraSuccess
  | DeleteCameraSuccess
  | RequestCamerasFailure
  | PatchCameraAreaRequest
  | PatchCameraAreaSuccess
  | PatchCameraAreaFailed;
