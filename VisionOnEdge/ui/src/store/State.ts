import { Annotation } from '../components/LabelingPage/types';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';

export interface State {
  cameras: Camera[];
  labelingPageState: LabelingPageState;
  part: Part;
}

export type LabelingPageState = { annotations: Annotation[] };

export const initialState: State = {
  cameras: [],
  labelingPageState: { annotations: [] },
  part: {
    capturedImages: [],
  },
};
