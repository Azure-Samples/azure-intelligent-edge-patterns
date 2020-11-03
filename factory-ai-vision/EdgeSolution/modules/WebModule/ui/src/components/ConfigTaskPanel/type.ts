import { ProjectData } from '../../store/project/projectTypes';

export type OnChangeType = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => void;
