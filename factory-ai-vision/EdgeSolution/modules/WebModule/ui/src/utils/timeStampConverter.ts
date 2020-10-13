/**
 * Format a datestring to "AUG 31, 2020, 1:54 PM"
 * @param timeStampString representing a simplification of the ISO 8601 calendar date extended format
 */
export const timeStampConverter = (timeStampString: string): string => {
  return new Date(Date.parse(timeStampString))
    .toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    })
    .toUpperCase();
};
