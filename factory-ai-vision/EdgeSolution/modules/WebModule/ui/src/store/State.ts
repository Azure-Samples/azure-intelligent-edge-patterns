import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { Location } from './location/locationTypes';
import { Project, Status } from './project/projectTypes';
import { LabelImage } from './image/imageTypes';
import { Setting } from './setting/settingType';

export interface State {
  dialogIsOpen: boolean;
  cameras: Camera[];
  locations: Location[];
  labelingPageState: LabelingPageState;
  part: Part;
  project: Project;
  demoProject: Project;
  images: LabelImage[];
  setting: Setting;
}

export type LabelingPageState = { annotations: Annotation[] };

const initialProject: Project = {
  isLoading: false,
  data: {
    id: null,
    camera: null,
    location: null,
    parts: [],
    needRetraining: true,
    accuracyRangeMin: 60,
    accuracyRangeMax: 80,
    maxImages: 20,
    modelUrl: '',
    sendMessageToCloud: false,
    framesPerMin: 6,
    accuracyThreshold: 50,
    probThreshold: '10',
  },
  originData: {
    id: null,
    camera: null,
    location: null,
    parts: [],
    needRetraining: true,
    accuracyRangeMin: 60,
    accuracyRangeMax: 80,
    maxImages: 50,
    modelUrl: '',
    sendMessageToCloud: false,
    framesPerMin: 6,
    accuracyThreshold: 50,
    probThreshold: '10',
  },
  trainingMetrics: {
    prevConsequence: null,
    curConsequence: null,
  },
  inferenceMetrics: {
    successRate: null,
    successfulInferences: null,
    unIdetifiedItems: null,
    isGpu: false,
    averageTime: null,
  },
  status: Status.None,
  error: null,
  trainingLog: '',
};

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
  project: initialProject,
  demoProject: initialProject,
  setting: {
    loading: false,
    error: null,
    current: {
      id: -1,
      key: '',
      namespace: '',
    },
    origin: {
      id: -1,
      key: '',
      namespace: '',
    },
    isTrainerValid: false,
    appInsightHasInit: false,
  },
};
