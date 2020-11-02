import { ProjectData } from '../../store/project/projectTypes';

export type OnChangeType = <K extends keyof P, P = ProjectData>(key: K, value: P[K]) => void;
