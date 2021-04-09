/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

// max for criticalHigh is arbitrary

export type SeverityLevel = Partial<keyof MinMaxVitalRange>;

export type VitalRange = [number, number];
interface MinMaxVitalRange {
  normal: VitalRange,
  mild: VitalRange,
  critical: VitalRange,
}
export const minMaxRangesForHeartRate: MinMaxVitalRange = {
  normal: [55, 95],
  mild: [95, 110],
  critical: [111, 120],
};

export const minMaxRangesForSBP: MinMaxVitalRange = {
  normal: [100, 140],
  mild: [141, 160],
  critical: [161, 185],
};

export const minMaxRangesForDBP: MinMaxVitalRange = {
  normal: [60, 100],
  mild: [101, 120],
  critical: [121, 150],
};

export const minMaxRangesForSpO2: MinMaxVitalRange = {
  normal: [94, 98],
  mild: [89, 94],
  critical: [88, 91],
};

export const minMaxRangesForRespiration: MinMaxVitalRange = {
  normal: [15, 24],
  mild: [22, 34],
  critical: [29, 38],
};

export const minMaxRangesForWeight: MinMaxVitalRange = {
  normal: [180, 220],
  mild: null,
  critical: null,
};
