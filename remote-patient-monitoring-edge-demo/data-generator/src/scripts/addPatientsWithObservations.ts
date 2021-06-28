#!/usr/bin/env node

/*
 *  Copyright (c) Microsoft Corporation.
 *  Licensed under the MIT license.
 */

import yargs, { exit } from 'yargs';
import {
  Destination,
  DestinationsOptions,
  HealthTrendsOptions,
  HEALTHY, IMPROVING,
  MAX_DAYS_ALLOWED,
  MAX_NUMBER_PATIENTS,
  MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS,
  WORSENING } from '../util/constants';
import { addPatientsAndObservations } from '../util/addGenericPatientsAndObservations';
import { HealthTrend } from '../util/trendFunctions';

export interface AddPatientsArguments {
  destination: Destination;
  numberOfDays: number | undefined;
  numberOfPatients: number;
  healthTrend: HealthTrend
}

const options: AddPatientsArguments = yargs
  .usage('Usage: -d <iothub or fhir> --numberOfPatients <numberOfPatients> -t <healthTrend> [--numberOfDays <numberOfDays> (optional. default is 1 - today)]')
  .options({
    destination: { alias: 'd', describe: 'Destination: iothub or fhir', choices: DestinationsOptions, demandOption: true },
    numberOfPatients: { describe: 'Number of patients to generate', type: 'number', demandOption: true },
    healthTrend: { alias: 't', describe: `Health Trend of created vitals over time: ${HEALTHY} or ${WORSENING} or ${IMPROVING}`, choices: HealthTrendsOptions, demandOption: true },
    numberOfDays: { describe: 'Past number of days to generate data for', type: 'number', demandOption: false },
  })
  .argv;

const notAtLeastMinimumTrendingDays = !options.numberOfDays || options.numberOfDays < MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS;
if (notAtLeastMinimumTrendingDays && options.healthTrend !== HEALTHY) {
  console.error(`Please select a numberOfDays >= ${MINIMUM_NO_OF_DAYS_FOR_TRENDING_VITALS} to generate WORSENING or IMPROVING patient data`);
  exit(1, new Error());
}
if (options.numberOfDays > MAX_DAYS_ALLOWED) {
  console.error(`Please select a numberOfDays of ${MAX_DAYS_ALLOWED} or less.`);
  exit(1, new Error());
}
if (options.numberOfPatients > MAX_NUMBER_PATIENTS) {
  console.error(`Please select a numberOfPatients of ${MAX_NUMBER_PATIENTS} or less.`);
  exit(1, new Error());
}

addPatientsAndObservations(options);
