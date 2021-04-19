#!/usr/bin/env node

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import yargs, { exit } from 'yargs';
import {
  Destination,
  DestinationsOptions,
  MAX_NUMBER_PATIENTS,
} from '../util/constants';

import { generateNewPatients } from '../util/patients';

export interface AddPatientsArgs {
  destination: Destination;
  numberOfPatients: number;
}

const options: AddPatientsArgs = yargs
  .usage('Usage: -d <iothub or fhir> -n <numberOfPatients>')
  .options({
    destination: { alias: 'd', describe: 'Destination: iothub or fhir', choices: DestinationsOptions, demandOption: true },
    numberOfPatients: { alias: 'n', describe: 'Number of patients to generate', type: 'number', demandOption: true },
  })
  .argv;

if (options.numberOfPatients > MAX_NUMBER_PATIENTS) {
  console.error(`Please select a numberOfPatients of ${MAX_NUMBER_PATIENTS} or less.`);
  exit(1, new Error());
}

generateNewPatients(options.numberOfPatients).then(patientIds => {
  console.log('Patients Created.');
  console.log(`Patient Uuids: ${patientIds}`);
}).catch(e => console.error('Error adding Patients: ', e));
