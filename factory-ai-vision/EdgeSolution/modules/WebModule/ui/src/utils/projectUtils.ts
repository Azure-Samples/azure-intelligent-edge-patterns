import { InferenceMode } from '../store/project/projectTypes';

export const extractRecommendFps = (totalRecommendedFPS: number, baseCameras: number): number => {
  return Math.round((totalRecommendedFPS / baseCameras) * 10) / 10;
};

export const getDeploymentProbThreshold = (inferenceMode, prob_threshold) => {
  if (inferenceMode === InferenceMode.EmptyShelfAlerts) return 50;
  return prob_threshold;
};
