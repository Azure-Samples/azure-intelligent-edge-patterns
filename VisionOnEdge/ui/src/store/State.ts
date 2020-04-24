import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { Location } from './location/locationTypes';

export interface State {
  dialogIsOpen: boolean;
  cameras: Camera[];
  locations: Location[];
  labelingPageState: LabelingPageState;
  part: Part;
}

export type LabelingPageState = { annotations: Annotation[] };

export const initialState: State = {
  dialogIsOpen: false,
  cameras: [],
  locations: [],
  labelingPageState: { annotations: [] },
  part: {
    capturedImages: [],
    isValid: true,
  },
};
