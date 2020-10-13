import { ProjectData } from '../store/project/projectTypes';

export type DemoProject = Pick<
  ProjectData,
  'id' | 'name' | 'inferenceMode' | 'trainingProject' | 'cameras' | 'parts'
>;
