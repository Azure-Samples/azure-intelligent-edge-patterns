/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IObservation } from '@ahryman40k/ts-fhir-types/lib/R4';
import faker from 'faker';
import { generateObservationsWithoutWeight, generateWeightObservation, observationTimesForNumberOfDays } from './observations';
import { SeverityLevel, VitalRange, minMaxRangesForWeight, minMaxRangesForDBP } from './vitalRanges';

export const generateRandomValueForVital = (range: VitalRange): number =>
  faker.random.number({
    min: range[0],
    max: range[1],
  });

const buildWeightObservationsWithLastDaySpike = (observationTimes: string[], patientId: string) => {
  const weightObservations: IObservation[] = [];
  let weight = generateRandomValueForVital(minMaxRangesForWeight.normal);

  const weights: number[] = [];
  observationTimes.forEach((observationTime: string, index: number) => {
    if (index === (observationTimes.length - 1)) {
      weight += generateRandomValueForVital([3, 5]);
    } else {
      weight += generateRandomValueForVital([-1, 1]);
    }
    weights.push(weight);
    weightObservations.push(generateWeightObservation(observationTime, patientId, weights));
  });
  return weightObservations;
};

const buildWeightObservationsOverTheLastWeekWithSpike = (observationTimes: string[], patientId: string) => {
  const weightObservations: IObservation[] = [];

  const lastSevenDays = observationTimes.slice(-7);
  let restOfDays = [];
  if ((observationTimes.length - 7) > 0) {
    restOfDays = observationTimes.slice(0, observationTimes.length - 7);
  }

  let weight = generateRandomValueForVital(minMaxRangesForWeight.normal);

  const weights: number[] = [];

  restOfDays.forEach((observationTime: string) => {
    weight += generateRandomValueForVital([-1, 1]);
    weights.push(weight);
    weightObservations.push(generateWeightObservation(observationTime, patientId, weights));
  });

  lastSevenDays.forEach((observationTime: string) => {
    weight += generateRandomValueForVital([1, 2]);
    weights.push(weight);
    weightObservations.push(generateWeightObservation(observationTime, patientId, weights));
  });

  return weightObservations;
};

const buildImprovingWeightObservations = (observationTimes: string[], patientId: string) => {
  const weightObservations: IObservation[] = [];
  const startingWeightRange: VitalRange = [200, 220];
  let weight = generateRandomValueForVital(startingWeightRange);

  const weights: number[] = [];

  observationTimes.forEach((observationTime: string) => {
    weight += generateRandomValueForVital([-3, 1]);
    weights.push(weight);
    weightObservations.push(generateWeightObservation(observationTime, patientId, weights));
  });
  return weightObservations;
};

const buildStatusQuoWeightObservations = (observationTimes: string[], patientId: string) => {
  const weightObservations: IObservation[] = [];
  let weight = generateRandomValueForVital(minMaxRangesForWeight.normal);
  const weights: number[] = [];
  const weightGainIncreaseThreshold = 4;

  observationTimes.forEach((observationTime: string) => {
    weight += generateRandomValueForVital([-1, 1]);
    if (weight > Math.min(...weights) + weightGainIncreaseThreshold) weight -= 1;
    weights.push(weight);
    weightObservations.push(generateWeightObservation(observationTime, patientId, weights));
  });
  return weightObservations;
};

const generateObsSetWithoutWeight = (severityLevel: SeverityLevel, obsTimes: string[], patientId: string): IObservation[] => {
  const collectedObservations: IObservation[] = [];

  obsTimes.forEach((datetime: string) => {
    collectedObservations.push(...generateObservationsWithoutWeight(datetime, patientId, severityLevel));
  });

  return collectedObservations;
};

const buildTrendingObservationsWithoutWeight = (patientId: string, numDays: number, severityLevels: SeverityLevel[]): IObservation[] => {
  const daysPerRangeSet = Math.floor(numDays / severityLevels.length);
  const observationTimes = observationTimesForNumberOfDays(numDays);
  observationTimes.reverse();

  const observationsOverSeverityLevelRanges = severityLevels.reduce((allObs: IObservation[], severityLevel: SeverityLevel, idx) => {
    const start = daysPerRangeSet * idx;
    const end = idx === severityLevels.length - 1 ? undefined : daysPerRangeSet * (idx + 1);
    const obsDateTimes = observationTimes.slice(start, end);

    return [...allObs, ...generateObsSetWithoutWeight(severityLevel, obsDateTimes, patientId)];
  }, []);

  return observationsOverSeverityLevelRanges;
};

export const buildWorseningObservationsForPatient = (patientId: string, numDays: number): IObservation[] => {
  const severityLevels: SeverityLevel[] = ['normal', 'mild', 'critical'];
  const allOtherVitals = buildTrendingObservationsWithoutWeight(patientId, numDays, severityLevels);
  const observationTimes = observationTimesForNumberOfDays(numDays);
  observationTimes.reverse();
  const weightVitals = numDays < 7 ? buildWeightObservationsWithLastDaySpike(observationTimes, patientId) : buildWeightObservationsOverTheLastWeekWithSpike(observationTimes, patientId);
  return [...allOtherVitals, ...weightVitals];
};

export const buildImprovingObservationsForPatient = (patientId: string, numDays: number): IObservation[] => {
  const severityLevels: SeverityLevel[] = ['critical', 'mild', 'normal'];
  const observationTimes = observationTimesForNumberOfDays(numDays);
  const allOtherVitals = buildTrendingObservationsWithoutWeight(patientId, numDays, severityLevels);
  observationTimes.reverse();
  const weightVitals = buildImprovingWeightObservations(observationTimes, patientId);
  return [...allOtherVitals, ...weightVitals];
};
export const buildStatusQuoObservationsForPatient = (patientId: string, numDays: number): IObservation[] => {
  const severityLevels: SeverityLevel[] = ['normal'];
  const observationTimes = observationTimesForNumberOfDays(numDays);
  const allOtherVitals = buildTrendingObservationsWithoutWeight(patientId, numDays, severityLevels);
  observationTimes.reverse();
  const weightVitals = buildStatusQuoWeightObservations(observationTimes, patientId);
  return [...allOtherVitals, ...weightVitals];
};
