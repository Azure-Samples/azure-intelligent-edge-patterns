import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { Location } from './location/locationTypes';
import { Project } from './project/projectTypes';

export interface State {
  dialogIsOpen: boolean;
  cameras: Camera[];
  locations: Location[];
  labelingPageState: LabelingPageState;
  part: Part;
  project: Project;
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
  project: {
    id: null,
    camera: null,
    location: null,
    parts: [],
    modelUrl: '',
    status: '',
    successRate: null,
    successfulInferences: null,
    unIdetifiedItems: null,
  },
};
