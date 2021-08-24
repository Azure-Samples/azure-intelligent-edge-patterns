import { ProjectData } from '../../store/project/projectTypes';

export type OnChangeType = <K extends keyof ProjectData>(
  key: K,
  value: ProjectData[K],
  optional?: { type: string; value: string },
) => void;
