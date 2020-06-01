import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { Location } from './location/locationTypes';
import { Project, Status } from './project/projectTypes';
import { LabelImage } from './image/imageTypes';

export interface State {
  dialogIsOpen: boolean;
  cameras: Camera[];
  locations: Location[];
  labelingPageState: LabelingPageState;
  part: Part;
  project: Project;
  images: LabelImage[];
}

export type LabelingPageState = { annotations: Annotation[] };

export const initialState: State = {
  dialogIsOpen: false,
  cameras: [],
  locations: [],
  images: [],
  labelingPageState: { annotations: [] },
  part: {
    capturedImages: [],
    isValid: true,
  },
  project: {
    isLoading: false,
    data: {
      id: null,
      camera: null,
      location: null,
      parts: [],
      needRetraining: true,
      accuracyRangeMin: 60,
      accuracyRangeMax: 80,
      maxImages: 50,
      modelUrl: '',
    },
    trainingMetrics: {
      prevConsequence: null,
      curConsequence: null,
    },
    inferenceMetrics: {
      successRate: null,
      successfulInferences: null,
      unIdetifiedItems: null,
    },
    status: Status.None,
    error: null,
    trainingLog: '',
  },
};
