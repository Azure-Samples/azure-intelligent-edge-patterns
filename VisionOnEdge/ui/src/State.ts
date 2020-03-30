export interface State {
  cameras: Camera[];
  part: Part;
}

export type Camera = { id?: string; name: string; rtsp: string; model_name: string };

export type Part = { capturedImages: string[] };

export const initialState: State = {
  cameras: [],
  part: {
    capturedImages: [],
  },
};
