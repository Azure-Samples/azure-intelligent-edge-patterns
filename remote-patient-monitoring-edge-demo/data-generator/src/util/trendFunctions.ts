/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { IBundle, IObservation } from '@ahryman40k/ts-fhir-types/lib/R4';
import { buildFhirBundleWithObservations } from './observations';
import { postObservationsForPatient } from './observationsClient';
import { buildStatusQuoObservationsForPatient, buildWorseningObservationsForPatient, buildImprovingObservationsForPatient } from './vitalForSeverityLevelDataHelpers';
import { HEALTHY, IMPROVING, WORSENING } from './constants';

export type HealthTrend = typeof HEALTHY | typeof IMPROVING | typeof WORSENING;

type TrendFuncsDictionary = {
  [key in HealthTrend]: {
    sendObsBundleToFhirFunc: (patientId: string, numDays: number) => Promise<void>,
    generateObsBundleFuncForIotHub: (patientId: string, numDays: number) => IBundle,
    buildObservationsForPatientFunc: (patientId: string, numDays: number) => IObservation[]
  }
};

export const trendFuncsDictionary: TrendFuncsDictionary = {
  healthy: {
    sendObsBundleToFhirFunc: async (patientId: string, numberOfDays: number): Promise<void> => {
      const observations = buildStatusQuoObservationsForPatient(patientId, numberOfDays);
      await postObservationsForPatient(patientId, observations);
    },
    generateObsBundleFuncForIotHub: (patientId: string, numberOfDays: number): IBundle => {
      const observations = buildStatusQuoObservationsForPatient(patientId, numberOfDays);
      return buildFhirBundleWithObservations(observations);
    },
    buildObservationsForPatientFunc: buildStatusQuoObservationsForPatient,

  },
  worsening: {
    sendObsBundleToFhirFunc: async (patientId: string, numberOfDays: number): Promise<void> => {
      const worseningObs = buildWorseningObservationsForPatient(patientId, numberOfDays);
      await postObservationsForPatient(patientId, worseningObs);
    },
    generateObsBundleFuncForIotHub: (patientId: string, numberOfDays: number): IBundle => {
      const worseningObs = buildWorseningObservationsForPatient(patientId, numberOfDays);
      return buildFhirBundleWithObservations(worseningObs);
    },
    buildObservationsForPatientFunc: buildWorseningObservationsForPatient,
  },
  improving: {
    sendObsBundleToFhirFunc: async (patientId: string, numberOfDays: number): Promise<void> => {
      const improvingObs = buildImprovingObservationsForPatient(patientId, numberOfDays);
      await postObservationsForPatient(patientId, improvingObs);
    },
    generateObsBundleFuncForIotHub: (patientId: string, numberOfDays: number): IBundle => {
      const improvingObs = buildImprovingObservationsForPatient(patientId, numberOfDays);
      return buildFhirBundleWithObservations(improvingObs);
    },
    buildObservationsForPatientFunc: buildImprovingObservationsForPatient,
  },
};
