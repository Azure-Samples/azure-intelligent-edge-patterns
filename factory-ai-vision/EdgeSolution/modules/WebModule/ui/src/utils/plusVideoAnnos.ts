import { VideoAnno } from '../store/shared/BaseShape';

export const plusOrderVideoAnnos = (videoAnnos: VideoAnno | any) => {
  return videoAnnos
    .sort((a, b) => {
      if (a.id > b.id) {
        return 1;
      }
      return -1;
    })
    .map((anno, i) => ({ ...anno, order: i + 1 }));
};
