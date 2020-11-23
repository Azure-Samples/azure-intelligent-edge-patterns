export const extractRecommendFps = (totalRecommendedFPS: number, baseCameras: number): number => {
  return Math.round((totalRecommendedFPS / baseCameras) * 10) / 10;
};
