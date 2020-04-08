// Describing the shape of the camera's slice of state
export type Camera = { id?: string; name: string; rtsp: string; model_name: string };

// Describing the different ACTION NAMES available
export const GET_CAMERA_SUCCESS = 'GET_CAMERA_SUCCESS';
export const REQUEST_CAMERA_FAILURE = 'REQUEST_CAMERA_FAILURE';
export const POST_CAMERA_SUCCESS = 'POST_CAMERA_SUCCESS';

export type GetCamerasSuccess = { type: typeof GET_CAMERA_SUCCESS; payload: Camera[] };
export type RequestCamerasFailure = { type: typeof REQUEST_CAMERA_FAILURE };
export type PostCamerasSuccess = { type: typeof POST_CAMERA_SUCCESS; payload: Camera };

export type CameraAction = GetCamerasSuccess | RequestCamerasFailure | PostCamerasSuccess;
