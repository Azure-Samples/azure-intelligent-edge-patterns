import { Annotation } from './labelingPage/labelingPageTypes';
import { Camera } from './camera/cameraTypes';
import { Part } from './part/partTypes';
import { NormalizedLocation, Notification } from '../reducers/type';
import { Project, Status } from './project/projectTypes';
import { LabelImage } from './image/imageTypes';
import { Setting } from './setting/settingType';
import { NormalizedPart } from '../reducers/partReducer';
import { NormalizedImage } from '../reducers/imageReducer';

export interface State {
  // Domain Data
  parts?: NormalizedPart;
  locations: NormalizedLocation;
  notifications: Notification[];
  // FIXME Change it to images
  labelImages?: NormalizedImage;
  // TODO: Refactor
  cameras: Camera[];
  project: Project;
  demoProject: Project;
  images: LabelImage[];
  setting: Setting;
  // App State
  labelingPageState: LabelingPageState;
  // UI State FIXME: Should be removed
  dialogIsOpen: boolean;
  part: Part;
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
  trainingLogs: [],
};

export const initialState: State = {
  dialogIsOpen: false,
  cameras: [],
  locations: {
    entities: {},
    result: [],
  },
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
    isTrainerValid: true,
    appInsightHasInit: true,
    isCollectData: false,
    appInsightKey: '',
  },
  notifications: [],
};
