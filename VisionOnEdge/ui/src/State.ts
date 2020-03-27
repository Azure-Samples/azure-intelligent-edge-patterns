export interface State {
  cameras: Camera[];
}
export type Camera = { id?: number; name: string; rtsp: string; model_name: string };
export const initialState: State = {
  cameras: [],
};
