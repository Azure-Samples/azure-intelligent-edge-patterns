export const getFPSPerCamera = (fps: number, cameraCount: number): number => {
  const result = Math.round(fps / cameraCount);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(result)) return 0;
  return result;
};
