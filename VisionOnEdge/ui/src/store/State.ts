import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { Location } from './location/locationTypes';

export interface State {
  cameras: Camera[];
  locations: Location[];
  labelingPageState: LabelingPageState;
  part: Part;
}

export type LabelingPageState = { annotations: Annotation[] };

export const initialState: State = {
  cameras: [],
  locations: [],
  labelingPageState: { annotations: [] },
  part: {
    capturedImages: [],
  },
};
