export const getIdFromUrl = (url: string): number => (url ? parseInt(url.split('/')[5], 10) : null);
