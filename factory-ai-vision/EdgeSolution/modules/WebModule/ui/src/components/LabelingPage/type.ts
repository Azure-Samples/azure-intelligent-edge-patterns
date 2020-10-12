import { Annotation } from '../../store/type';

export enum LabelingCursorStates {
  default = 'default',
  pointer = 'pointer',
  crosshair = 'crosshair',
  neswResize = 'nesw-resize',
  nwseResize = 'nwse-resize',
}

export interface Box2dComponentProps {
  workState: WorkState;
  scale: number;
  onSelect?: Function;
  annotation: Annotation;
  annotationIndex: number;
  selected?: boolean;
  visible?: boolean;
  dispatch?: any;
  changeCursorState?: (cursorType?: LabelingCursorStates) => void;
  color?: string;
  draggable?: boolean;
  // instanceID: number;
}

export enum WorkState {
  Creating = 'Creating',
  Selecting = 'Selecting',
  None = 'None',
}

export enum LabelingType {
  SingleAnnotation = 0,
  MultiAnnotation = 1,
}
