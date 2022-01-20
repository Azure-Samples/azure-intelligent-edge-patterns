#!/usr/bin/env node

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { exit } from 'yargs';
import { postObservationsForPatient } from './observationsClient';
import { sendObsBundleRequestForPatientToIoT } from './iotMessageSender';
import { buildFhirBundleWithObservations } from './observations';
import { FHIR_SERVER } from './constants';
import { trendFuncsDictionary } from './trendFunctions';
import { AddObsArguments } from '../scripts/addObservations';

export const addObservations = async (options: AddObsArguments): Promise<void> => {
  const trendFunctions = trendFuncsDictionary[options.healthTrend];
  const observations = trendFunctions.buildObservationsForPatientFunc(options.patientUuid, options.numberOfDays);

  if (options.destination === FHIR_SERVER) {
    postObservationsForPatient(options.patientUuid, observations);
  } else {
    const createObsBundleForPatientAndSendToIot = (patientId: string) => new Promise((resolve) => {
      const observationsBundle = buildFhirBundleWithObservations(observations);
      sendObsBundleRequestForPatientToIoT(patientId, observationsBundle).then(() => resolve('OK'));
    });

    const generateAndSendObservationsToIotHub = async (patientId: string) => {
      const observationEntries = [];
      observationEntries.push(createObsBundleForPatientAndSendToIot(patientId));

      await Promise.all(observationEntries).then(() => exit(0, new Error()));
    };

    generateAndSendObservationsToIotHub(options.patientUuid);
  }
};
