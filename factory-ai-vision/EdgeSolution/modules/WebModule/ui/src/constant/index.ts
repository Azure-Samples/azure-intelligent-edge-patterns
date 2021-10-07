import Url from './Url';

export { Url };

export type TrainStatus =
  | 'Finding project'
  | 'Uploading project'
  | 'Uploading project'
  | 'Uploading parts'
  | 'Uploading images'
  | 'Preparing training task'
  | 'Preparing custom vision environment'
  | 'Training'
  | 'Exporting'
  | 'Success'
  | 'Failed'
  | 'No change'
  | 'ok'
  | 'Deploying';
