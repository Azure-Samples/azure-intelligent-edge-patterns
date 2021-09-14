import { Annotation, Image } from '../../../store/type';

export type EnhanceImage = Exclude<Image, 'labels'> & {
  labels: Annotation[];
};
