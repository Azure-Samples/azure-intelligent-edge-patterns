#!/usr/bin/env node

/* eslint-disable no-restricted-syntax */

/* 
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import { exit } from 'yargs';
import { generateNewPatients } from './patients';
import { sendObsBundleRequestForPatientToIoT } from './iotMessageSender';
import { FHIR_SERVER } from './constants';
import { trendFuncsDictionary } from './trendFunctions';
import { AddPatientsArguments } from '../scripts/addPatientsWithObservations';

export const addPatientsAndObservations = async (options: AddPatientsArguments): Promise<void> => {
  const patientIds = await generateNewPatients(options.numberOfPatients);
  const trendFunctions = trendFuncsDictionary[options.healthTrend];

  if (options.destination === FHIR_SERVER) {
    const createObservationsInSequence = () =>
      patientIds.reduce((p, patientId) => p.then(() => trendFunctions.sendObsBundleToFhirFunc(patientId, options.numberOfDays)), Promise.resolve());
    createObservationsInSequence();
  } else {
    const createObservationsForPatient = (patientId: string) => new Promise((resolve) => {
      const observationsBundle = trendFunctions.generateObsBundleFuncForIotHub(patientId, options.numberOfDays);
      sendObsBundleRequestForPatientToIoT(patientId, observationsBundle).then(() => resolve('OK'));
    });

    const generateNewPatientsAndObservations = async () => {
      const observationEntries = [];
      patientIds.forEach((patientId: string) => {
        observationEntries.push(createObservationsForPatient(patientId));
      });
      await Promise.all(observationEntries).then(() => exit(0, new Error()));
    };

    generateNewPatientsAndObservations();
  }
};
