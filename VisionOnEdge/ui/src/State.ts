import { Annotation } from './components/LabelingPage/types';

export interface State {
  cameras: Camera[];
  labelingPageState: LabelingPageState;
  part: Part;
}

export type Camera = { id?: number; name: string; rtsp: string; model_name: string };

export type Part = { capturedImages: string[] };

export type LabelingPageState = { annotations: Annotation[] };

export const initialState: State = {
  cameras: [],
  labelingPageState: { annotations: [] },
  part: {
    capturedImages: [],
  },
};
