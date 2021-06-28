/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import {
  BundleTypeKind,
  Bundle_RequestMethodKind,
  IBundle,
  IBundle_Entry,
  IBundle_Request,
  IObservation,
  ObservationStatusKind,
} from '@ahryman40k/ts-fhir-types/lib/R4';
import { DateObjectUnits, DateTime } from 'luxon';
import { generateRandomValueForVital } from './vitalForSeverityLevelDataHelpers';
import { SeverityLevel, minMaxRangesForDBP, minMaxRangesForHeartRate, minMaxRangesForRespiration, minMaxRangesForSBP, minMaxRangesForSpO2 } from './vitalRanges';

const transformObservationsToBundleEntries = (observations: IObservation[]): IBundle_Entry[] => {
  const requestInfo: IBundle_Request = {
    method: Bundle_RequestMethodKind._post,
    url: 'Observation',
  };
  return observations.map((ob: IObservation) => ({ resource: { ...ob }, request: requestInfo }));
};

const buildFhirBundleWithObservationEntries = (observations: IBundle_Entry[]): IBundle => ({
  resourceType: 'Bundle',
  type: BundleTypeKind._transaction,
  entry: [...observations],
});

export const buildFhirBundleWithObservations = (observations: IObservation[]): IBundle => {
  const obsWithResourceField = transformObservationsToBundleEntries(observations);

  return buildFhirBundleWithObservationEntries(obsWithResourceField);
};

export const observationTimesForNumberOfDays = (numberOfDays: number | undefined = 1): string[] => {
  const startOfDay: DateObjectUnits = { hour: 0, minute: 0, second: 0, millisecond: 0 };
  const localTime = DateTime.local().set(startOfDay);

  const observationTimes: string[] = [localTime.toISO()];
  for (let differenceOfDays = 1; differenceOfDays < numberOfDays; differenceOfDays += 1) {
    observationTimes.push(localTime.minus({ days: differenceOfDays }).toISO());
  }
  return observationTimes;
};

const LOINC_URL = 'http://loinc.org';
const UNITS_OF_MEASURE_URL = 'http://unitsofmeasure.org';

const getWeightSpecificProperties = (allWeightVitals: number[]) => ({
  code: {
    coding: [
      {
        system: LOINC_URL,
        code: '3141-9',
        display: 'Weight measured',
      },
    ],
  },
  valueQuantity: {
    value: allWeightVitals[allWeightVitals.length - 1],
    system: UNITS_OF_MEASURE_URL,
    code: 'lbs',
  },
});

export const generateWeightObservation = (effectiveDateTime: string, patientGuid: string, allWeightVitals: number[]): IObservation => {
  const baseObservation: IObservation = {
    resourceType: 'Observation',
    effectiveDateTime,
    status: ObservationStatusKind._preliminary,
    subject: {
      reference: `Patient/${patientGuid}`,
    },
    code: { coding: [] },
  };

  const weightObservation: IObservation = {
    ...baseObservation,
    ...getWeightSpecificProperties(allWeightVitals),
  };

  return weightObservation;
};

export const generateObservationsWithoutWeight = (effectiveDateTime: string, patientGuid: string, severityLevel: SeverityLevel): IObservation[] => {
  const baseObservation: IObservation = {
    resourceType: 'Observation',
    effectiveDateTime,
    status: ObservationStatusKind._preliminary,
    subject: {
      reference: `Patient/${patientGuid}`,
    },
    code: { coding: [] },
  };

  const getHrSpecificProperties = () => {
    const value = generateRandomValueForVital(minMaxRangesForHeartRate[severityLevel]);

    return {
      code: {
        coding: [
          {
            system: LOINC_URL,
            code: '8867-4',
            display: 'Heart Rate',
          },
        ],
      },
      valueQuantity: {
        value,
        system: UNITS_OF_MEASURE_URL,
        code: 'bpm',
      },
    };
  };

  const getDbpSpecificProperties = () => {
    const value = generateRandomValueForVital(minMaxRangesForDBP[severityLevel]);

    return {
      code: {
        coding: [
          {
            system: LOINC_URL,
            code: '8462-4',
            display: 'Diastolic blood pressure',
          },
        ],
      },
      valueQuantity: {
        value,
        system: UNITS_OF_MEASURE_URL,
        code: 'mmHg',
      },
    };
  };

  const getSbpSpecificProperties = () => {
    const value = generateRandomValueForVital(minMaxRangesForSBP[severityLevel]);

    return {
      code: {
        coding: [
          {
            system: LOINC_URL,
            code: '8480-6',
            display: 'Systolic blood pressure',
          },
        ],
      },
      valueQuantity: {
        value,
        system: UNITS_OF_MEASURE_URL,
        code: 'mmHg',
      },
    };
  };

  const getSp02SpecificProperties = () => {
    const value = generateRandomValueForVital(minMaxRangesForSpO2[severityLevel]);

    return {
      code: {
        coding: [
          {
            system: LOINC_URL,
            code: '59408-5 ',
            display: 'Oxygen saturation',
          },
        ],
      },
      valueQuantity: {
        value,
        system: UNITS_OF_MEASURE_URL,
        code: '%',
      },
    };
  };

  const getRespSpecificProperties = () => {
    const value = generateRandomValueForVital(minMaxRangesForRespiration[severityLevel]);

    return {
      code: {
        coding: [
          {
            system: LOINC_URL,
            code: '9279-1',
            display: 'Respiratory rate',
          },
        ],
      },
      valueQuantity: {
        value,
        system: UNITS_OF_MEASURE_URL,
        code: 'breaths/min',
      },
    };
  };

  const hrObservation: IObservation = {
    ...baseObservation,
    ...getHrSpecificProperties(),
  };

  const sbpObservatrion: IObservation = {
    ...baseObservation,
    ...getSbpSpecificProperties(),
  };

  const dbpObservation: IObservation = {
    ...baseObservation,
    ...getDbpSpecificProperties(),
  };

  const sp02Observation: IObservation = {
    ...baseObservation,
    ...getSp02SpecificProperties(),
  };

  const respObservation: IObservation = {
    ...baseObservation,
    ...getRespSpecificProperties(),
  };

  return [
    hrObservation,
    sbpObservatrion,
    dbpObservation,
    sp02Observation,
    respObservation,
  ];
};
